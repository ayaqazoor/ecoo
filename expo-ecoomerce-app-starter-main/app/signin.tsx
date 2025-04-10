import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '@/components/InputField';
import { Colors } from '@/constants/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase'; // استيراد auth من ملف firebase.js
import OAuth from '@/components/OAuth';
import { FirebaseError } from 'firebase/app'; // استيراد FirebaseError
import { doc, getDoc, setDoc } from "firebase/firestore"; // استيراد Firestore
import { db } from "@/config/firebase"; // استيراد db من ملف firebase.js


interface UserData {
  email: string;
  createdAt: Date;
  role: 'user' | 'admin'; // أو أي قيمة ممكنة لحقل role
  settings: {
    darkMode: boolean;
    language: string;
  };
}

const SignInScreen = () => {
  const [email, setEmail] = useState(''); // حفظ الإيميل
  const [password, setPassword] = useState(''); // حفظ كلمة المرور
  const [rememberMe, setRememberMe] = useState(false); // حالة التذكر
  const [isAdmin, setIsAdmin] = useState(false); // حالة لتحديد إذا كان المستخدم أدمن

  // دالة لتسجيل الدخول
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const userRef = doc(db, "users", user.uid); 
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            createdAt: new Date(),
            role: 'user', // إذا كان المستخدم عاديًا
            settings: {
              darkMode: false,
              language: 'en',
            },
          });
        }

        // التحقق من دور المستخدم
        const userData: UserData = userSnap.data() as UserData; // استخدام النوع هنا
        if (userData.role === 'admin') {
          setIsAdmin(true);  // إذا كان المستخدم أدمن، نغير القيمة لتكون true
        } else {
          setIsAdmin(false);  // إذا لم يكن أدمن
        }

        // بعد تسجيل الدخول بنجاح، انتقل إلى الصفحة الرئيسية أو لوحة التحكم
        Alert.alert("You have successfully logged in!");
        router.replace("/(tabs)"); // الانتقال إلى الصفحة الرئيسية
      } else {
        Alert.alert("Error: User does not exist");
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        Alert.alert("An error occurred.", error.message);
      } else if (error instanceof Error) {
        Alert.alert("An unexpected error occurred", error.message);
      } else {
        Alert.alert("An unknown error occurred");
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
        <Text style={styles.title}>Login to Your Account</Text>
        
       
        <InputField 
          placeholder="Email Address" 
          placeholderTextColor={Colors.gray}
          autoCapitalize="none"
          keyboardType="email-address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}   
        />

        <InputField 
          placeholder="Password" 
          placeholderTextColor={Colors.gray}
          secureTextEntry={true}
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword} 
        />

        {/* خيار Remember Me */}
        <TouchableOpacity 
          style={styles.rememberMeContainer} 
          onPress={() => setRememberMe(!rememberMe)}
        >
          <Ionicons 
            name={rememberMe ? "checkbox-outline" : "square-outline"} 
            size={22} 
            color={Colors.primary} 
          />
          <Text style={styles.rememberMeText}>Remember Me</Text>
        </TouchableOpacity>

        {/* زر تسجيل الدخول */}
        <TouchableOpacity 
          style={styles.btn} 
          onPress={handleSignIn} // عند الضغط على الزر، نفذ دالة تسجيل الدخول
        >
          <Text style={styles.btnTxt}>Login</Text>
        </TouchableOpacity>

        <OAuth /> {/* يمكن إضافة تسجيل الدخول باستخدام جوجل أو فيسبوك هنا */}

        {/* رابط إنشاء حساب جديد */}
        <Text style={styles.loginTxt}>
          Don't have an account?{" "} 
          <Link href={"/signup"} asChild>
            <Text style={styles.loginTxtSpan}>Sign Up</Text>
          </Link>
        </Text>

        {/* زر لوحة التحكم (يظهر فقط للأدمن) */}
        {isAdmin && (
          <TouchableOpacity 
            style={styles.adminBtn} 
            onPress={() => router.push("/AdminPanel")}
          >
            <Text style={styles.adminBtnTxt}>Go to Admin Panel</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 8,
  },
  adminBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  adminBtnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignInScreen;
