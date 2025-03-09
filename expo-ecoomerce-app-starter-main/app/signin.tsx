import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Link, router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import InputField from '@/components/InputField'
import { Colors } from '@/constants/Colors'
import SocialLoginButtons from '@/components/SocialLoginButtons'

type Props = {}

const SignInScreen = (props: Props) => {
  return (
    <>
    <Stack.Screen 
    options={{
      headerTitle: '',
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="close-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      ),
    }} 
  />
  <View style={styles.container}>
    <Text style={styles.title}>Login to Your Account</Text>
    <InputField 
    placeholder='Email Address' 
    placeholderTextColor={Colors.gray}
    autoCapitalize='none'
    keyboardType='email-address'
    />
     <InputField 
    placeholder='Password' 
    placeholderTextColor={Colors.gray}
   secureTextEntry={true}
    />

    <TouchableOpacity style={styles.btn} onPress={() => {
          router.dismissAll();
          router.push('/(tabs)');
          
        }}>
      <Text style={styles.btnTxt } >Login</Text>
    </TouchableOpacity>
    
  <View style={styles.divider}/>
  <Text style={styles.loginTxt}> Don't have an account? {" "} 
          <Link href={"/signup"} asChild>
              <Text style={styles.loginTxtSpan}>  SignUp </Text>
          </Link>
          </Text>
  <SocialLoginButtons emailHref={'/signin'}/>
  </View>
</>
    
  )
}

export default SignInScreen

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
 btnTxt:{
color: Colors.white,
fontSize: 16,
fontWeight: '600',
 },
 loginTxt: {
  marginBottom: 30,
  fontSize: 14,
  color: Colors.black,
  lineHeight: 24,
},
loginTxtSpan:{
  color: Colors.gray,
  fontWeight: '600',
  marginBottom: -4,
},
divider:{
  borderTopColor: Colors.gray,
  borderTopWidth: StyleSheet.hairlineWidth,
  width: '30%',
  marginBottom: 30,
},
})