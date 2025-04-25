// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth"; 
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5DT4u3PFRrbnID1CqQ49K_y8kpQJrzRY",
  authDomain: "mh-giftif.firebaseapp.com",
  projectId: "mh-giftif",
  storageBucket: "mh-giftif.appspot.com",
  messagingSenderId: "897071317692",
  appId: "1:897071317692:web:be9cb7bab4987bc32646b9",
  measurementId: "G-B0PKK39BK1"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// دالة لتسجيل Expo Push Token في Firestore
const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    alert('Push notifications only work on physical devices.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  try {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { expoPushToken: token }, { merge: true });
      console.log("✅ Expo push token saved to Firestore");
    }
  } catch (error) {
    console.error("❌ Error saving push token: ", error);
  }

  return token;
};

export {
  auth,
  db,
  storage,
  updateProfile,
  registerForPushNotifications,
};
