import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Google from '@/assets/images/google-logo.svg';
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import SocialLoginButtons from "@/components/SocialLoginButtons";
type Props = {};

const WelcomeScreen = (props: Props) => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require('@/assets/images/coverr.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
          < LinearGradient
            colors={['transparent', 'rgba(217, 189, 173, 0.25)', 'rgba(217, 189, 173, 0.34)']}
            style={styles.background}
          >
            <View style={styles.wrapper}>
              <View style={styles.topButtonWrapper}>
                <Link href={"/signin"} asChild>
                  <TouchableOpacity style={styles.topButton}>
                    <Text style={styles.topButtonText}>SignIn</Text>
                  </TouchableOpacity>
                </Link>

                <Link href={"/signup"} asChild>
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>
                </Link>
              </View>



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
  background: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  wrapper: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
    letterSpacing: 1.4,
    marginBottom: 18,
  },

  loginTxt: {
    marginTop: 20,
    marginBottom: -20,
    fontSize: 14,
    color: Colors.black,
    lineHeight: 24,
  },
  loginTxtSpan: {
    color: Colors.gray,
    fontWeight: '600',
    marginBottom: -4,
  },

  // Style for the button wrapper to make them appear next to each other
  topButtonWrapper: {
    flexDirection: 'row', // Arrange buttons horizontally
    justifyContent: 'space-between', // Space between buttons
    width: '100%', // Ensure the buttons stretch across the available space
    marginBottom: 70, // Space below the buttons
  },

  topButton: {
    flex: 1, // Make buttons take equal width
    borderTopLeftRadius:30,
    borderBottomLeftRadius:30,
    borderTopRightRadius:0,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0, // Space between buttons
    paddingVertical: 20, // Add padding for button height
  },

  topButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center', // Center text inside button
  },

  // Register button styling with beige color
  registerButton: {
    flex: 1,
    borderTopLeftRadius:0,
    borderTopRightRadius:30,
    borderBottomRightRadius:30,
    backgroundColor: '#D9BDAD', // Beige color
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    paddingVertical: 20,
  },

  registerButtonText: {
    
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black, // Text color for beige button
    textAlign: 'center', 
  },
  
  
});