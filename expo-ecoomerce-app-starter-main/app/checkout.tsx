import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

// Interface for order item
interface OrderItem {
  productId: string;
  name: string;
  images: string[];
  price: number;
  quantity: number;
}

// Interface for order
interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  shippingInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    region: string;
  };
  paymentInfo: {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  status: string;
  createdAt: Timestamp;
}

// Utility function to send notification
const sendNotification = async (toToken: string, title: string, body: string, userId: string, orderId?: string) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      orderId: orderId || null,
      createdAt: Timestamp.fromDate(new Date()),
      status: 'pending',
    });
    console.log('Notification saved to Firestore:', { userId, title, body, orderId });

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toToken,
        sound: 'default',
        title,
        body,
        priority: 'high',
        data: { orderId: orderId || '' },
      }),
    });

    const result = await response.json();
    console.log('Push notification response:', result);

    if (result.errors) {
      console.error('Push notification errors:', result.errors);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Notify admins on order
const notifyAdminsOnOrder = async (userName: string, orderDetails: string, orderId: string) => {
  try {
    const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminDocs = await getDocs(adminQuery);
    const adminTokens = adminDocs.docs
      .map((doc) => {
        const data = doc.data();
        return { token: data.expoPushToken, userId: data.uid };
      })
      .filter((entry): entry is { token: string; userId: string } => !!entry.token && typeof entry.token === 'string');

    console.log('Admin Tokens:', adminTokens);

    if (adminTokens.length === 0) {
      console.log('No admin tokens found');
      return;
    }

    adminTokens.forEach(({ token, userId }) => {
      sendNotification(token, 'طلبية جديدة', `طلبية من ${userName}: ${orderDetails}`, userId, orderId);
    });
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

// Function to send user thank-you notification
const sendUserOrderConfirmation = async (order: Order) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    console.log('Authenticated user:', user?.uid || 'None');
    console.log('Attempting to send order confirmation for user:', order.userId);

    // Fetch user document directly by ID
    const userDocRef = doc(db, 'users', order.userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('No user document found for userId:', order.userId);
      return;
    }

    const userToken = userDoc.data()?.expoPushToken;

    const itemsSummary = order.items
      .map((item: OrderItem) => {
        if (!item.name || !item.quantity) {
          console.warn('Invalid item data:', item);
          return 'Unknown Item';
        }
        return `${item.name} (الكمية: ${item.quantity})`;
      })
      .join(', ');

    await addDoc(collection(db, 'notifications'), {
      userId: order.userId,
      title: 'شكراً لتسوقك من M&H Store!',
      body: `شكراً لشرائك! طلبيتك: ${itemsSummary}. المجموع: ₪${order.total}`,
      orderId: order.id,
      createdAt: Timestamp.fromDate(new Date()),
      status: 'pending',
    });

    if (!userToken) {
      console.log('No expoPushToken found');
      return;
    }

    const message = {
      to: userToken,
      sound: 'default',
      title: 'شكراً لتسوقك من M&H Store!',
      body: `شكراً لشرائك! طلبيتك: ${itemsSummary}. المجموع: ₪${order.total}`,
      data: { orderId: order.id || '' },
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('User order confirmation sent successfully:', result);
    } else {
      console.error('Failed to send notification:', result);
      if (result.errors) {
        console.error('Expo error details:', result.errors);
      }
    }
  } catch (error) {
    console.error('Error in sendUserOrderConfirmation:', error);
  }
};

const CheckoutScreen: React.FC = () => {
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingOption, setShippingOption] = useState<'westbank' | 'inside48'>('westbank');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  useEffect(() => {
    try {
      if (params.items && typeof params.items === 'string') {
        const parsedItems = JSON.parse(params.items);
        setCartItems(parsedItems);
        
        // Calculate total from cart items
        const calculatedTotal = parsedItems.reduce((acc: number, item: any) => {
          return acc + (item.price * item.quantity);
        }, 0);
        setTotal(calculatedTotal);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing data:', error);
      Alert.alert('Error', 'Failed to load order data');
      router.back();
    }
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlaceOrder = async () => {
    try {
      if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (paymentMethod === 'card' && (!formData.cardNumber || !formData.expiryDate || !formData.cvv)) {
        Alert.alert('Error', 'Please fill in card details');
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'Please sign in to place an order');
        router.push('/signin');
        return;
      }

      console.log('User ID:', user.uid, 'Order User ID:', user.uid);

      const shippingFee = shippingOption === 'westbank' ? 20 : 60;
      const finalTotal = total + shippingFee;

      // Create a detailed item list with all necessary fields including images
      const orderItems = cartItems.map(item => ({
        productId: item.productId || item.id,
        name: item.name || item.title || 'Unknown',
        images: item.images ? item.images : [item.image],
        price: item.price,
        quantity: item.quantity,
      }));

      const orderData: Order = {
        userId: user.uid,
        items: orderItems,
        total: finalTotal,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        shippingInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          region: shippingOption,
        },
        paymentInfo: {
          method: paymentMethod,
          ...(paymentMethod === 'card' ? {
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
          } : {}),
        },
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
      };

      const ordersRef = collection(db, 'orders');
      const orderRef = await addDoc(ordersRef, orderData);
      orderData.id = orderRef.id;

      // Create detailed order details for admin notification
      const orderDetails = `رقم الطلب: ${orderData.id}, العناصر: ${orderItems
        .map(item => `${item.name} (الكمية: ${item.quantity}, السعر: ₪${item.price})`)
        .join(', ')}, المجموع: ₪${finalTotal}, العميل: ${formData.fullName}, الهاتف: ${formData.phone}, العنوان: ${formData.address}, ${formData.city}`;

      // Send user confirmation notification
      await sendUserOrderConfirmation(orderData);

      // Notify admins
      await notifyAdminsOnOrder(formData.fullName, orderDetails, orderData.id);
      console.log('Admins notified:', { customerName: formData.fullName, orderDetails });

      Alert.alert(
        'Success',
        `Your order has been placed successfully!\nTotal: ₪${finalTotal}`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { marginTop: headerHeight }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerLine} />

        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>
                    {item.title || item.name || 'اسم غير متوفر'}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₪{item.price.toFixed(2)} x {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                placeholder="Enter your full name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter your address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                placeholder="Enter your city"
              />
            </View>
            <View style={styles.shippingOptions}>
              <Text style={styles.label}>Shipping Region</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.option, shippingOption === 'westbank' && styles.selectedOption]}
                  onPress={() => setShippingOption('westbank')}
                >
                  <Ionicons
                    name={shippingOption === 'westbank' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={shippingOption === 'westbank' ? Colors.primary : Colors.gray}
                  />
                  <Text style={styles.optionText}>West Bank (₪20)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.option, shippingOption === 'inside48' && styles.selectedOption]}
                  onPress={() => setShippingOption('inside48')}
                >
                  <Ionicons
                    name={shippingOption === 'inside48' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={shippingOption === 'inside48' ? Colors.primary : Colors.gray}
                  />
                  <Text style={styles.optionText}>Inside 48 (₪60)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[styles.option, paymentMethod === 'cash' && styles.selectedOption]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Ionicons
                  name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={paymentMethod === 'cash' ? Colors.primary : Colors.gray}
                />
                <Text style={styles.optionText}>Cash on Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.option, paymentMethod === 'card' && styles.selectedOption]}
                onPress={() => setPaymentMethod('card')}
              >
                <Ionicons
                  name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={paymentMethod === 'card' ? Colors.primary : Colors.gray}
                />
                <Text style={styles.optionText}>Credit Card</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'card' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.cardNumber}
                    onChangeText={(text) => handleInputChange('cardNumber', text)}
                    placeholder="Enter card number"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.expiryDate}
                      onChangeText={(text) => handleInputChange('expiryDate', text)}
                      placeholder="MM/YY"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.cvv}
                      onChangeText={(text) => handleInputChange('cvv', text)}
                      placeholder="CVV"
                      keyboardType="number-pad"
                      secureTextEntry
                    />
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cart Total</Text>
              <Text style={styles.summaryValue}>₪{total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>₪{shippingOption === 'westbank' ? '20.00' : '60.00'}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ₪{(total + (shippingOption === 'westbank' ? 20 : 60)).toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  headerLine: {
    height: 1,
    backgroundColor: '#eee',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  shippingOptions: {
    paddingBottom: 16,
  },
  paymentOptions: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.extraLightGray,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  summarySection: {
    padding: 16,
    backgroundColor: Colors.extraLightGray,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.primary,
  },
});

export default CheckoutScreen;