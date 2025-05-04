import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { db } from '@/config/firebase';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Interface for order item (aligned with CheckoutScreen)
interface OrderItem {
  productId: string;
  name: string;
  images: string[];
  price: number;
  quantity: number;
}

// Interface for order (aligned with CheckoutScreen)
interface Order {
  id: string;
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
  createdAt: Date;
}

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      console.log('No authenticated user found.');
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync(currentUser.uid)
      .catch(error => console.error('Error registering for notifications:', error));

    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setNotifications(prev => [{ ...notification, id: Date.now().toString() }, ...prev]);
    });

    // Check user role and set up listeners
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      const userData = doc.data();
      if (!userData) return;

      // Admin: Listen for new orders
      if (userData.role === 'admin') {
        const ordersQuery = collection(db, 'orders');
        onSnapshot(ordersQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const order = { id: change.doc.id, ...change.doc.data() } as Order;
              sendAdminOrderNotification(order)
                .catch(error => console.error('Error sending admin notification:', error));
            }
          });
        }, error => console.error('Error listening to orders:', error));
      }

      // User: Listen for order status updates
      if (userData.role === 'user') {
        const userOrdersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        onSnapshot(userOrdersQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const order = { id: change.doc.id, ...change.doc.data() } as Order;
              if (order.status === 'confirmed') {
                sendUserShippingNotification(order)
                  .catch(error => console.error('Error sending shipping notification:', error));
              }
            }
          });
        }, error => console.error('Error listening to user orders:', error));

        // Schedule promotional notifications for users
        const intervalId = setInterval(() => {
          sendPromotionalNotification(currentUser.uid)
            .catch(error => console.error('Error sending promotional notification:', error));
        }, 9 * 60 * 60 * 1000); // Every 9 hours

        return () => clearInterval(intervalId);
      }
    }, error => console.error('Error fetching user data:', error));

    return () => {
      subscription.remove();
      unsubscribeUser();
    };
  }, [currentUser]);

  // Function to send admin notification for new orders
  const sendAdminOrderNotification = async (order: Order) => {
    try {
      const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminDocs = await getDocs(adminQuery);
      const adminTokens = adminDocs.docs
        .map(doc => doc.data().expoPushToken)
        .filter(token => token);

      if (adminTokens.length === 0) {
        console.log('No admin tokens found.');
        return;
      }

      const itemsSummary = order.items
        .map(item => `${item.name} (الكمية: ${item.quantity})`)
        .join(', ');

      const message = {
        to: adminTokens,
        sound: 'default',
        title: 'طلبية جديدة',
        body: `طلبية من ${order.customerName} في ${order.customerAddress}, ${order.customerCity}. المنتجات: ${itemsSummary}`,
        data: { orderId: order.id },
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
      console.log('Admin notification sent:', result);
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  };

  // Function to send user shipping notification
  const sendUserShippingNotification = async (order: Order) => {
    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('uid', '==', order.userId)
      ));
      const userToken = userDoc.docs[0]?.data().expoPushToken;

      if (!userToken) {
        console.log('No push token for user:', order.userId);
        return;
      }

      const message = {
        to: userToken,
        sound: 'default',
        title: 'تم شحن طلبيتك!',
        body: 'تم شحن طلبيتك وستصل خلال 2-3 أيام عمل.',
        data: { orderId: order.id },
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
      console.log('User shipping notification sent:', result);
    } catch (error) {
      console.error('Error sending user shipping notification:', error);
    }
  };

  // Function to send promotional notification
  const sendPromotionalNotification = async (userId: string) => {
    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('uid', '==', userId)
      ));
      const userToken = userDoc.docs[0]?.data().expoPushToken;

      if (!userToken) {
        console.log('No push token for user:', userId);
        return;
      }

      const message = {
        to: userToken,
        sound: 'default',
        title: 'اكتشف منتجاتنا الجديدة!',
        body: 'تفقد أحدث المنتجات في M&H Store.',
        data: { screen: 'Products' },
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
      console.log('Promotional notification sent:', result);
    } catch (error) {
      console.error('Error sending promotional notification:', error);
    }
  };

  // Register for push notifications
  async function registerForPushNotificationsAsync(userId: string) {
    if (!Constants.isDevice) {
      console.log('Push notifications require a physical device. Skipping registration.');
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        role: 'user', // Default to user
      }, { merge: true });
      return;
    }
  
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
  
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
  
      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied.');
        await setDoc(doc(db, 'users', userId), {
          uid: userId,
          role: 'user', // Default to user
        }, { merge: true });
        return;
      }
  
      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
  
      // Store token and role in Firestore
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        expoPushToken: token,
        role: userId.includes('admin') ? 'admin' : 'user', // Adjust role logic
      }, { merge: true });
  
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      // Store user data without token on error
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        role: 'user', // Default to user
      }, { merge: true });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الإشعارات</Text>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>لا توجد إشعارات حالياً</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.text}>{item.request.content.title}</Text>
              <Text style={styles.text}>{item.request.content.body}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  noNotifications: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});

export default NotificationsScreen;