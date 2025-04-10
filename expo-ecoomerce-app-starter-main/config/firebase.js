// استيراد الوظائف التي نحتاجها من Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth , updateUserProfile} from "firebase/auth";  // إضافة auth
import { getFirestore } from "firebase/firestore";  // إضافة firestore
import { getAnalytics } from "firebase/analytics";

// إعدادات Firebase الخاصة بتطبيقك
const firebaseConfig = {
  apiKey: "AIzaSyB5DT4u3PFRrbnID1CqQ49K_y8kpQJrzRY",
  authDomain: "mh-giftif.firebaseapp.com",
  projectId: "mh-giftif",
  storageBucket: "mh-giftif.firebasestorage.app",
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

// تهيئة Analytics (اختياري)
const analytics = getAnalytics(app);

// تصدير auth و db حتى نستخدمهم في باقي المشروع
// تصدير auth و db حتى نستخدمهم في باقي المشروع
export { auth, db, updateUserProfile };
