import { View, Text, StyleSheet, ScrollView, Platform, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, collection, where, query, orderBy, addDoc, onSnapshot, Timestamp, getDocs, QueryDocumentSnapshot, DocumentData, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

// Define a type for in-app notifications
type InAppNotification = {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  orderId?: string;
};

// Notification handler for system notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PushNotifications = () => {
  const [token, setToken] = useState<string>('');
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [orderDetailsCache, setOrderDetailsCache] = useState<{ [orderId: string]: any }>({});
  const auth = getAuth();
  const user = auth.currentUser;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;

  // Real-time listener for notifications
  useEffect(() => {
    if (!user) {
      console.log('No user logged in');
      setInAppNotifications([]);
      setOrderDetailsCache({});
      return;
    }

    console.log('Setting up onSnapshot for user:', user.uid);

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, async (querySnapshot) => {
      try {
        const notifications = await Promise.all(querySnapshot.docs.slice(0, 5).map(async (docSnap) => {
          const data = docSnap.data();
          let orderId = data.orderId as string | undefined;
          if (orderId && !orderDetailsCache[orderId]) {
            try {
              const orderDoc = await getDoc(doc(db, 'orders', orderId));
              if (orderDoc.exists()) {
                const orderInfo = orderDoc.data();
                setOrderDetailsCache(prev => ({ ...prev, [orderId]: orderInfo }));
              }
            } catch (e) { /* ignore */ }
          }
          return {
            id: docSnap.id,
            title: data.title || 'No Title',
            body: data.body || 'No Body',
            timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            orderId: data.orderId,
          };
        }));
        setInAppNotifications(notifications);
      } catch (error) {
        console.error('Error processing onSnapshot data:', error);
      }
    }, (error) => {
      console.error('onSnapshot error:', error);
      Alert.alert('Error', 'Failed to fetch notifications: ' + error.message);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (user) {
      registerPushToken(user.uid);
    } else {
      console.log('No user logged in');
    }

    // Listener for foreground notifications
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      if (title && body && user) {
        console.log('Foreground notification received:', { title, body, orderId: data?.orderId });
        addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title,
          body,
          orderId: data?.orderId || null,
          createdAt: Timestamp.fromDate(new Date()),
          status: 'delivered',
        }).catch((error) => console.error('Error saving foreground notification:', error));
      }
    });

    // Listener for background/quit state notifications
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body, data } = response.notification.request.content;
      if (title && body && user) {
        console.log('Background notification received:', { title, body, orderId: data?.orderId });
        addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title,
          body,
          orderId: data?.orderId || null,
          createdAt: Timestamp.fromDate(new Date()),
          status: 'delivered',
        }).catch((error) => console.error('Error saving background notification:', error));
      }
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, [user]);

  const registerPushToken = async (userId: string) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token: Permissions not granted');
        return;
      }

      const pushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId || undefined,
        })
      ).data;

      setToken(pushToken);
      console.log('Expo Push Token:', pushToken);

      await setDoc(
        doc(db, 'users', userId),
        {
          uid: userId,
          expoPushToken: pushToken,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error registering push token:', error);
      Alert.alert('Error registering push token');
    }
  };

  const sendNotification = async (toToken: string, title: string, body: string, userId: string, orderId?: string) => {
    try {
      // Save to Firestore for in-app display
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
        Alert.alert('Failed to send push notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error sending notification');
    }
  };

  // Notify admins on order
  const notifyAdminsOnOrder = async (userName: string, orderDetails: string, orderId: string) => {
    try {
      const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminDocs = await getDocs(adminQuery);
      const adminTokens = adminDocs.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => {
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

  // Send thank you notification
  const sendThankYouNotification = async (userId: string, orderId: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
      if (userDoc.empty) {
        console.log('User not found');
        return;
      }

      const userData = userDoc.docs[0].data();
      const userToken = userData.expoPushToken;

      if (userToken) {
        sendNotification(
          userToken,
          'شكراً لشرائك من M&H Store',
          'نشكرك على ثقتك بنا. سنقوم بمعالجة طلبيتك في أقرب وقت ممكن.',
          userId,
          orderId
        );
      }
    } catch (error) {
      console.error('Error sending thank you notification:', error);
    }
  };

  // Send order confirmation notification
  const sendOrderConfirmationNotification = async (userId: string, orderId: string) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
      if (userDoc.empty) {
        console.log('User not found');
        return;
      }

      const userData = userDoc.docs[0].data();
      const userToken = userData.expoPushToken;

      if (userToken) {
        sendNotification(
          userToken,
          'تم تأكيد طلبيتك',
          'تم تأكيد طلبيتك وستصل خلال 2-3 أيام عمل.',
          userId,
          orderId
        );
      }
    } catch (error) {
      console.error('Error sending order confirmation notification:', error);
    }
  };

  // Helper to get order details (from cache or Firestore)
  const getOrderDetails = async (orderId: string) => {
    if (orderDetailsCache[orderId]) return orderDetailsCache[orderId];
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        setOrderDetailsCache(prev => ({ ...prev, [orderId]: orderData }));
        return orderData;
      }
    } catch (e) {}
    return null;
  };

  // Helper to get doc ref
  const docRef = (col: string, id: string) => doc(db, col, id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔔 إشعارات M&H</Text>
      <Text style={styles.token}>{token || 'جارٍ توليد التوكن...'}</Text>
      <View style={styles.notificationsContainer}>
        <Text style={styles.notificationsTitle}>الإشعارات داخل التطبيق</Text>
        {inAppNotifications.length === 0 ? (
          <Text style={styles.noNotifications}>لا توجد إشعارات حالياً</Text>
        ) : (
          inAppNotifications.map((notification) => {
            let order = notification.orderId && orderDetailsCache[notification.orderId];
            let userName = '';
            let total = null;
            let items: any[] = [];
            if (order) {
              userName = order.customerName || order.userName || '';
              total = order.total;
              items = order.items || [];
            }
            return (
              <View key={notification.id} style={styles.notificationCard}>
                {order && (
                  <Text style={styles.userName}>{userName}</Text>
                )}
                <View style={{ flexDirection: 'column', gap: 8 }}>
                  {order && items.length > 0 ? (
                    items.map((item, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Image source={{ uri: item.images && item.images.length > 0 ? item.images[0] : undefined }} style={styles.notificationImage} />
                        <Text style={[styles.productName, { flex: 1, marginLeft: 8 }]} numberOfLines={1} ellipsizeMode="tail">{item.name || item.title || 'اسم غير متوفر'}</Text>
                        <Text style={styles.productQty}>x{item.quantity}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.notificationImagePlaceholder}>
                        <Ionicons name="notifications-outline" size={32} color="#ccc" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationBody}>{notification.body}</Text>
                      </View>
                    </View>
                  )}
                </View>
                {order && (
                  <Text style={styles.orderTotal}>المجموع: ₪{total}</Text>
                )}
                <Text style={styles.notificationTimestamp}>
                  {new Date(notification.timestamp).toLocaleString('ar-EG')}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  token: {
    fontSize: 10,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  notificationsContainer: {
    marginTop: 20,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noNotifications: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  notificationImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userName: { fontSize: 15, fontWeight: 'bold', color: Colors.primary, marginBottom: 6, textAlign: 'left' },
  productQty: { fontSize: 14, color: Colors.gray, marginLeft: 8, minWidth: 32, textAlign: 'right' },
  orderTotal: { fontSize: 15, color: Colors.primary, fontWeight: 'bold', marginTop: 6, textAlign: 'left' },
});

export default PushNotifications;