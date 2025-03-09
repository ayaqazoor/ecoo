import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, router, Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import InputField from '@/components/InputField';
import SocialLoginButtons from '@/components/SocialLoginButtons';

const SignUpScreen = () => {
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <>
      <Stack.Screen
       options={{
          headerTitle:'',
        }} 
      />
      <View style={styles.container}>
        {/* زر الإغلاق */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>

        {/* عنوان الصفحة */}
        <Text style={styles.title}>Create your Account</Text>

        {/* حقول الإدخال */}
        <InputField 
          placeholder="Enter your email" 
          placeholderTextColor={Colors.gray}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <InputField 
          placeholder="Password" 
          placeholderTextColor={Colors.gray}
          secureTextEntry={true}
        />
        <InputField 
          placeholder="Confirm Password" 
          placeholderTextColor={Colors.gray}
          secureTextEntry={true}
        />

        {/* Remember Me */}
        <TouchableOpacity 
          style={styles.rememberMeContainer} 
          onPress={() => setRememberMe(!rememberMe)}
        >
          <Ionicons 
            name={rememberMe ? "checkbox-outline" : "square-outline"} 
            size={20} 
            color={Colors.primary} 
          />
          <Text style={styles.rememberMeText}> Remember me</Text>
        </TouchableOpacity>

        {/* زر التسجيل مع التنقل لصفحة تسجيل الدخول */}
        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => router.push("/signin")} 
        > 
          <Text style={styles.btnTxt}>Register</Text>
        </TouchableOpacity>

  <View style={styles.divider}/>

        {/* رابط الانتقال إلى تسجيل الدخول */}
        <Text style={styles.loginTxt}> Already have an account? {" "} 
          <Link href="/signin" asChild>
            <TouchableOpacity>
              <Text style={styles.loginTxtSpan}>Login </Text>
            </TouchableOpacity>
          </Link>
        </Text>

        {/* أزرار تسجيل الدخول عبر مواقع التواصل */}
        <SocialLoginButtons emailHref={'/signup'}/>
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
  closeBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: "#5E4033",
    marginBottom: 30,  
  },
  btn: { 
    backgroundColor: "#5E4033",
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 20,
  },
  btnTxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
  },
  loginTxt: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
  },
  loginTxtSpan: {
    color: "#8B5E3C",
    fontWeight: '700',
    marginBottom: -4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#5E4033",
  },
  divider:{
    borderTopColor: Colors.gray,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '30%',
    marginBottom: 30,
  },
});
