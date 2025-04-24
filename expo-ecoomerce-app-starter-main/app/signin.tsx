import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '@/components/InputField';
import { Colors } from '@/constants/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OAuth from '@/components/OAuth';

interface UserData {
  email: string;
  createdAt: Date;
  role: 'user' | 'admin';
  settings: {
    darkMode: boolean;
    language: string;
  };
}

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // دالة تحميل البيانات من AsyncStorage لما تفتح الصفحة
  useEffect(() => {
    const loadRememberedData = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedPassword = await AsyncStorage.getItem('rememberedPassword');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        if (savedRememberMe === 'true') setRememberMe(true);
      } catch (error) {
        console.log("Failed to load remembered data:", error);
      }
    };

    loadRememberedData();
  }, []);

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
            role: 'user',
            settings: {
              darkMode: false,
              language: 'en',
            },
          });
        }

        const userData: UserData = userSnap.data() as UserData;
        if (userData?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        // حفظ بيانات الريميمبر مي إذا مفعل
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', email);
          await AsyncStorage.setItem('rememberedPassword', password);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          // إذا مو مفعل احذف البيانات
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.removeItem('rememberedPassword');
          await AsyncStorage.removeItem('rememberMe');
        }

        Alert.alert("You have successfully logged in!");
        router.replace("/(tabs)");
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
          onPress={handleSignIn}
        >
          <Text style={styles.btnTxt}>Login</Text>
        </TouchableOpacity>

        <OAuth />

        {/* رابط إنشاء حساب جديد */}
        <Text style={styles.loginTxt}>
          Don't have an account?{" "} 
          <Link href={"/signup"} asChild>
            <Text style={styles.loginTxtSpan}>Sign Up</Text>
          </Link>
        </Text>

        {/* زر لوحة التحكم (للأدمن فقط) */}
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
