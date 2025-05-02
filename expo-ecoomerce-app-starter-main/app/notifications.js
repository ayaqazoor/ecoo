import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// Initialize notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    const deviceId = (await Device.getDeviceIdAsync());

    // Save the token to Firestore
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        expoPushToken: token,
        deviceId,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }
};

// Reusable function to send push notification
export const sendPushNotification = async (token, title, body, data = {}) => {
  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Send notification to all users
export const sendBroadcastNotification = async (title, body, data = {}) => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const token = doc.data().expoPushToken;
        if (token) {
          await sendPushNotification(token, title, body, data);
        }
      })
    );
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
  }
};

// Send notification to admin
export const sendAdminNotification = async (title, body, data = {}) => {
  try {
    const adminsRef = collection(db, 'admins');
    const adminsSnapshot = await getDocs(adminsRef);
    
    await Promise.all(
      adminsSnapshot.docs.map(async (doc) => {
        const token = doc.data().expoPushToken;
        if (token) {
          await sendPushNotification(token, title, body, data);
        }
      })
    );
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

// Send order confirmation notification
export const sendOrderConfirmationNotification = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const order = await getDoc(orderRef);
    
    if (order.exists()) {
      const userData = await getDoc(doc(db, 'users', order.data().userId));
      if (userData.exists()) {
        const token = userData.data().expoPushToken;
        if (token) {
          await sendPushNotification(
            token,
            'Order Confirmation',
            'Your order has been confirmed and is now being shipped. Expected delivery: 2–3 days.',
            { orderId }
          );
        }
      }
    }
  } catch (error) {
    console.error('Error sending order confirmation notification:', error);
  }
};
