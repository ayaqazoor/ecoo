import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '@/components/InputField';
import { Colors } from '@/constants/Colors';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase'; // استيراد auth من ملف firebase.js
import { FirebaseError } from 'firebase/app'; // استيراد FirebaseError
import { doc, setDoc, collection, getDocs } from "firebase/firestore"; // استيراد Firestore
import { db } from "@/config/firebase"; // استيراد db من ملف firebase.js

const SignUpScreen = () => {
  const [email, setEmail] = useState(''); // حفظ الإيميل
  const [password, setPassword] = useState(''); // حفظ كلمة المرور
  const [confirmPassword, setConfirmPassword] = useState(''); // حفظ تأكيد كلمة المرور
  const [usersCount, setUsersCount] = useState(0); // عدد المستخدمين الحاليين

  // دالة للتحقق من عدد المستخدمين
  const fetchUserCount = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsersCount(querySnapshot.size); // عدد المستخدمين
    } catch (error) {
      console.error("Error fetching users count: ", error);
    }
  };

  useEffect(() => {
    fetchUserCount(); // جلب عدد المستخدمين عند تحميل الشاشة
  }, []);

  // دالة لإنشاء حساب جديد
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }

    try {
      // محاولة إنشاء حساب جديد باستخدام البريد الإلكتروني وكلمة المرور
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // تحديد دور المستخدم (Admin لأول 3 مستخدمين)
      const userRole = usersCount < 3 ? "admin" : "user";

      // إضافة بيانات المستخدم إلى Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        createdAt: new Date(),
        role: userRole,  // تحديد الدور للمستخدم
        settings: {
          darkMode: false,  // إعدادات مبدئية مثل الوضع الداكن
          language: 'en',   // اللغة الافتراضية
        },
      });

      Alert.alert('Account created successfully!');
      router.replace('/(tabs)'); // الانتقال إلى الصفحة الرئيسية بعد إنشاء الحساب

    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        // عرض الخطأ إذا كان من Firebase
        Alert.alert('حدث خطأ', error.message);
      } else if (error instanceof Error) {
        // في حال كان الخطأ عام
        Alert.alert('An unexpected error occurred.', error.message);
      } else {
        // إذا كان الخطأ غير معروف
        Alert.alert('An unknown error occurred.');
      }
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Account</Text>

        {/* إدخال البريد الإلكتروني مع أيقونة */}
        <InputField 
          placeholder="Email Address" 
          placeholderTextColor={Colors.gray}
          autoCapitalize="none"
          keyboardType="email-address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail} // تحديث الإيميل
        />

        {/* إدخال كلمة المرور مع أيقونة */}
        <InputField 
          placeholder="Password" 
          placeholderTextColor={Colors.gray}
          secureTextEntry={true}
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword} // تحديث كلمة المرور
        />

        {/* إدخال تأكيد كلمة المرور مع أيقونة */}
        <InputField 
          placeholder="Confirm Password" 
          placeholderTextColor={Colors.gray}
          secureTextEntry={true}
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword} // تحديث تأكيد كلمة المرور
        />

        {/* زر إنشاء الحساب */}
        <TouchableOpacity 
          style={styles.btn} 
          onPress={handleSignUp} // عند الضغط على الزر، نفذ دالة إنشاء الحساب
        >
          <Text style={styles.btnTxt}>Sign Up</Text>
        </TouchableOpacity>

        {/* رابط العودة إلى شاشة تسجيل الدخول */}
        <Text style={styles.loginTxt}>
          Already have an account?{" "}
          <Link href="/signin" asChild>
            <Text style={styles.loginTxtSpan}>Login</Text>
          </Link>
        </Text>
      </View>
    </>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white, 
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.primary,
    marginBottom: 50,  
  },
  btn: { 
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 20,
  },
  btnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginTxt: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 24,
    marginTop: 70,
  },
  loginTxtSpan: {
    color: Colors.gray,
    fontWeight: '600',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
});

