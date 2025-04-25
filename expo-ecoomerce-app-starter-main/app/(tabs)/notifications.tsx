import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { db } from '@/config/firebase'; // استيراد firebase.js (تأكدي أنه تم التصدير بشكل صحيح)
import { doc, setDoc } from 'firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // طلب الأذونات وتسجيل التوكن
    registerForPushNotificationsAsync();

    // الاستماع للإشعارات الواردة
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.text}>{item.request.content.title}</Text>
            <Text style={styles.text}>{item.request.content.body}</Text>
          </View>
        )}
      />
    </View>
  );
};

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // طلب الأذونات
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // التحقق من الأذونات
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    // الحصول على التوكن الخاص بالإشعار
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // تخزين التوكن في Firestore
    // تأكد من أن لديك مستخدم مسجل هنا
    const user = { uid: 'user-id' }; // استبدلي هذا بـ user id الفعلي
    await setDoc(doc(db, 'users', user.uid), {
      expoPushToken: token,
    });
  } else {
    alert('Must use physical device for Push Notifications');
  }
}

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
  },
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default NotificationsScreen;
