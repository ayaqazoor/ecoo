import { View, Text, StyleSheet, ScrollView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { 
  doc, setDoc, collection, where, query, orderBy, addDoc, 
  onSnapshot, Timestamp, getDocs, QueryDocumentSnapshot, DocumentData, getDoc 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

// Define a type for in-app notifications
type InAppNotification = {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  orderId?: string;
  isOrder?: boolean; // Flag to identify order-based notifications
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
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Real-time listener for notifications
  useEffect(() => {
    if (!user) {
      console.log('No user logged in');
      setInAppNotifications([]);
      setOrderDetailsCache({});
      setIsAdmin(false);
      return;
    }

    console.log('Setting up onSnapshot for user:', user.uid);

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, async (querySnapshot) => {
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
            isOrder: false,
          };
        }));
        setInAppNotifications(prev => {
          // Merge notifications, keeping only the latest 5 non-order notifications
          const existingOrderNotifications = prev.filter(n => n.isOrder);
          return [...notifications, ...existingOrderNotifications].slice(0, 10);
        });
      } catch (error) {
        console.error('Error processing notifications onSnapshot data:', error);
      }
    }, (error) => {
      console.error('Notifications onSnapshot error:', error);
      Alert.alert('Error', 'Failed to fetch notifications: ' + error.message);
    });

    return () => unsubscribeNotifications();
  }, [user]);

  // Real-time listener for orders (for admins)
  useEffect(() => {
    if (!user || !isAdmin) {
      setInAppNotifications(prev => prev.filter(n => !n.isOrder));
      return;
    }

    console.log('Setting up onSnapshot for orders');

    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
      try {
        const orderNotifications = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const itemsSummary = data.items?.map((item: any) => `${item.name || 'Unknown'} (x${item.quantity})`).join(', ') || 'No items';
          return {
            id: docSnap.id,
            title: 'طلبية جديدة',
            body: `من ${data.customerName || 'Unknown'} - ${data.customerCity || 'Unknown'}: ${itemsSummary}، المجموع: ₪${data.total || 0}`,
            timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            orderId: docSnap.id,
            isOrder: true,
          } as InAppNotification;
        });
        setInAppNotifications(prev => {
          // Merge order notifications with existing non-order notifications
          const existingNonOrderNotifications = prev.filter(n => !n.isOrder).slice(0, 5);
          return [...orderNotifications, ...existingNonOrderNotifications].slice(0, 10);
        });
        // Cache order details
        querySnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          setOrderDetailsCache(prev => ({
            ...prev,
            [docSnap.id]: {
              customerName: data.customerName || 'Unknown',
              customerCity: data.customerCity || data.shippingInfo?.city || 'Unknown',
              total: data.total || 0,
              items: data.items || [],
              status: data.status || 'pending',
            },
          }));
        });
      } catch (error) {
        console.error('Error processing orders onSnapshot data:', error);
      }
    }, (error) => {
      console.error('Orders onSnapshot error:', error);
      Alert.alert('Error', 'Failed to fetch orders: ' + error.message);
    });

    return () => unsubscribeOrders();
  }, [user, isAdmin]);

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
      // Removed duplicate notification addition
    });

    // Listener for background/quit state notifications
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      // Removed duplicate notification addition
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
        senderId: getAuth().currentUser?.uid || '',
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

  const docRef = (col: string, id: string) => doc(db, col, id);

  useEffect(() => {
    if (!user) {
      setInAppNotifications([]);
      setOrderDetailsCache({});
      setIsAdmin(false);
      return;
    }
    const fetchRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    };
    fetchRole();
  }, [user]);

  useEffect(() => {
    if (tab === 'orders') {
      setActiveTab('orders');
    }
  }, [tab]);

  return (
    <>
      <View style={[styles.headerContainer, { marginTop: 40 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="cart-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerLine} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.notificationsContainer}>
          <Text style={styles.sectionTitle}>الإشعارات</Text>
          {inAppNotifications.length === 0 ? (
            <Text style={styles.noNotifications}>لا توجد إشعارات حالياً</Text>
          ) : (
            inAppNotifications.map((notification) => {
              let order = notification.orderId && orderDetailsCache[notification.orderId];
              let userName = '';
              let userCity = '';
              let total = null;
              let items: any[] = [];
              let status = '';
              if (order) {
                userName = order.customerName || order.userName || '';
                userCity = order.customerCity || order.shippingInfo?.city || '';
                total = order.total;
                items = order.items || [];
                status = order.status || 'pending';
              }
              const handlePress = () => {
                if (notification.orderId && isAdmin) {
                  router.push({ pathname: '/AdminPanel', params: { tab: 'orders', orderId: notification.orderId } });
                }
              };
              const Wrapper = isAdmin && notification.orderId ? TouchableOpacity : View;
              return (
                <Wrapper key={notification.id} style={styles.notificationCard} {...(isAdmin && notification.orderId ? { activeOpacity: 0.7, onPress: handlePress } : {})}>
                  {order && (
                    <Text style={styles.userName}>
                      {userName}
                      {userCity ? ` - ${userCity}` : ''}
                    </Text>
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
                    <>
                      <Text style={styles.orderTotal}>المجموع: ₪{total}</Text>
                      <Text style={styles.orderStatus}>الحالة: {status}</Text>
                    </>
                  )}
                  <Text style={styles.notificationTimestamp}>
                    {new Date(notification.timestamp).toLocaleString('ar-EG')}
                  </Text>
                </Wrapper>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
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
  token: {
    fontSize: 10,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  notificationsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.primary,
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
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
    textAlign: 'left',
  },
  productQty: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
  orderTotal: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'left',
  },
  orderStatus: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'left',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 5,
  },
  cartButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 10,
  },
  headerLine: {
    height: 1,
    backgroundColor: Colors.primary,
  },
});

export default PushNotifications;