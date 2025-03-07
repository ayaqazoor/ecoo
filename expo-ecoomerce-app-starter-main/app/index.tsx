import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Google from '@/assets/images/google-logo.svg';
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";

type Props = {};

const WelcomeScreen = (props: Props) => {
  return (
    <>
    <Stack.Screen options={{headerShown: false}}/>
    <ImageBackground source={require('@/assets/images/cover.jpeg')} style={{flex: 1}} resizeMode="cover">
    <View style={styles.container}>
      <LinearGradient colors={['transparent','rgba(249, 212, 210, 0.25)', 'rgba(193, 110, 104, 0.36)']} style={styles.background}>
        <View style={styles.wrapper}>
          <Animated.Text style={styles.title} entering={FadeInRight.delay(300).duration(300).springify()}>Littel Luxuries, Big Smile </Animated.Text>

      <View style={styles.socialloginWrapper}> 
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
      <Link href={"/signup"} asChild>
        <TouchableOpacity style={styles.button}>
          <Ionicons name='mail-outline' size={20} color={Colors.black}/>
          <Text style={styles.btnTxt}>Continue With Email</Text>
        </TouchableOpacity>
      </Link> 
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).duration(500)}>
        <TouchableOpacity style={styles.button}>
        <Google width={20} height={20} />
        <Text style={styles.btnTxt}>Continue With Google</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1100).duration(500)}>
        <TouchableOpacity style={styles.button}>
          <Ionicons name='logo-apple' size={20} color={Colors.black}/>
          <Text style={styles.btnTxt}>Continue With Apple</Text>
        </TouchableOpacity>
      </Animated.View>

      </View>
     <Text style={styles.loginTxt}> Already have an account? {" "} 
      <Link href={"/signin"} asChild>
        <TouchableOpacity>
          <Text style={styles.loginTxtSpan}>  SignIn </Text>
        </TouchableOpacity>
      </Link>
      </Text>
      </View>

      </LinearGradient>
    </View>
    </ImageBackground>
    </>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background:{
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  wrapper: {
    paddingBottom: 90,
    paddingHorizontal: 20, 
    alignItems: 'center',
  },
  title:{
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
    letterSpacing: 1.4,
    marginBottom: 18,
    
  },
  socialloginWrapper:{
    alignSelf: 'stretch',

  },
  button: {
    flexDirection:'row',
    padding: 10,
    borderColor: Colors.gray,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent:'center',
    gap: 5,
    marginBottom: 15,
  },
  btnTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black ,
  },
  loginTxt: {
    marginTop: 30,
    fontSize: 14,
    color: Colors.black,
    lineHeight: 24,
  },
  loginTxtSpan:{
    color: Colors.gray,
    fontWeight: '600',
    marginBottom: -4,
  },
});
