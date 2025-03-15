import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '@/components/InputField';
import { Colors } from '@/constants/Colors';
import OAuth from '@/components/OAuth';

const SignInScreen = () => {
  const [rememberMe, setRememberMe] = useState(false); // حالة التذكر

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
        
        {/* إدخال البريد الإلكتروني مع أيقونة */}
        <InputField 
          placeholder="Email Address" 
          placeholderTextColor={Colors.gray}
          autoCapitalize="none"
          keyboardType="email-address"
          icon="mail-outline"
        />

        {/* إدخال كلمة المرور مع أيقونة */}
        <InputField 
          placeholder="Password" 
          placeholderTextColor={Colors.gray}
          secureTextEntry={true}
          icon="lock-closed-outline"
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
          onPress={() => {
            router.dismissAll();
            router.push('/(tabs)');
          }}
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
      </View>
    </>
  );
};

export default SignInScreen;

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
});