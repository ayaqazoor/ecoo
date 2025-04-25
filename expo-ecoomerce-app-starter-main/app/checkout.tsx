import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, FlatList, KeyboardTypeOptions
} from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import DropDownPicker from 'react-native-dropdown-picker';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { total: rawTotal } = useLocalSearchParams();
  const productTotal = parseFloat(rawTotal as string) || 0;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState<'westbank' | 'inside48'>('westbank');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [cities, setCities] = useState([
    { label: 'Nablus', value: 'Nablus' },
    { label: 'Ramallah', value: 'Ramallah' },
    { label: 'Hebron', value: 'Hebron' },
    { label: 'Jenin', value: 'Jenin' },
    { label: 'Tulkarm', value: 'Tulkarm' },
    { label: 'Jerusalem', value: 'Jerusalem' },
  ]);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const deliveryFee = region === 'westbank' ? 20 : 60;
  const finalTotal = productTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address || !city) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      Alert.alert('Card Information Missing', 'Please fill in card details.');
      return;
    }

    Alert.alert('Order Confirmed', `Your order was placed successfully!\nTotal: ₪${finalTotal}`);
    navigation.goBack();

    // إرسال إشعار للمستخدم بعد الطلب
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const token = userSnap.data()?.expoPushToken;

        if (token) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: token,
              sound: 'default',
              title: 'Order Received 🎁',
              body: `Thank you for your order at M&H! Total: ₪${finalTotal}`,
            }),
          });
        }
      }
    } catch (error) {
      console.log('Failed to send notification:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Checkout</Text>

      {/* بقية عناصر الشيك اوت (نفس الكود السابق) */}
      {/* لا حاجة لتعديل الجزء الخاص بالفورم والمعلومات */}

      {/* في النهاية */}
      <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
};

export const unstable_settings = {
  headerShown: false,
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 30,
    textAlign: "center",
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: Colors.gray,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  dropdown: {
    borderColor: '#ccc',
    marginBottom: 15,
    height: 40,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    color: Colors.primary,
    fontSize: 18,
    marginRight: 5,
  },
  unselected: {
    color: Colors.lightGray,
    fontSize: 18,
    marginRight: 5,
  },
  optionText: {
    fontSize: 16,
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
