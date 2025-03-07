import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, router, Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import InputField from '@/components/InputField';

const SignUpScreen = () => {
  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: 'Sign Up',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.title}>Create an account</Text>
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
        <InputField 
        placeholder='Confirm Password' 
        placeholderTextColor={Colors.gray}
       secureTextEntry={true}
        />

        <TouchableOpacity style={styles.btn}> 
          <Text style={styles.btnTxt } >Creat an account</Text>
        </TouchableOpacity>
        <Text style={styles.loginTxt}> Already have an account? {" "} 
              <Link href={"/signin"} asChild>
                <TouchableOpacity>
                  <Text style={styles.loginTxtSpan}>  SignIn </Text>
                </TouchableOpacity>
              </Link>
              </Text>
      <View style={styles.divider}/>
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
}
});
