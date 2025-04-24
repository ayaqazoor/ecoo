// استيراد الوظائف التي نحتاجها من Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; // ✅ استيراد التخزين
import { getAnalytics } from "firebase/analytics";

// إعدادات Firebase الخاصة بتطبيقك
const firebaseConfig = {
  apiKey: "AIzaSyB5DT4u3PFRrbnID1CqQ49K_y8kpQJrzRY",
  authDomain: "mh-giftif.firebaseapp.com",
  projectId: "mh-giftif",
  storageBucket: "mh-giftif.appspot.com", // ✅ هنا كان عندك خطأ صغير (حطتيه .app بدل .com)
  messagingSenderId: "897071317692",
  appId: "1:897071317692:web:be9cb7bab4987bc32646b9",
  measurementId: "G-B0PKK39BK1"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة الـ Authentication (تسجيل الدخول)
const auth = getAuth(app);

// تهيئة Firestore
const db = getFirestore(app);

// تهيئة Storage (رفع صور المنتجات)
const storage = getStorage(app);

// تهيئة Analytics (اختياري)
const analytics = getAnalytics(app);

// تصدير auth و db و storage و updateProfile
export { auth, db, storage, updateProfile };
