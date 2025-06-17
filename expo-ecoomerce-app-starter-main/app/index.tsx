import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link, Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { router } from 'expo-router';

type Props = {};

const WelcomeScreen = (props: Props) => {
  const router = useRouter(); // <== استوردنا الراوتر هنا

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require('@/assets/images/coverr.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <LinearGradient
            colors={['transparent', 'rgba(217, 189, 173, 0.25)', 'rgba(217, 189, 173, 0.34)']}
            style={styles.background}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                router.replace("/(tabs)"); // <== لما نكبس إكس، نروح عالتابس
              }}
            >
              <Ionicons name="close" size={30} color={Colors.black} />
            </TouchableOpacity>

            <View style={styles.wrapper}>
              <View style={styles.topButtonWrapper}>
                <Link href={"/signin"} asChild>
                  <TouchableOpacity style={styles.topButton}>
                    <Text style={styles.topButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </Link>

                <Link href={"/signup"} asChild>
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* ممكن تحطي هنا SocialLoginButtons إذا بدك */}
              {/* <SocialLoginButtons /> */}

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
  topButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 70,
  },
  topButton: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    paddingVertical: 20,
  },
  topButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  registerButton: {
    flex: 1,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#D9BDAD',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    paddingVertical: 20,
  },
  registerButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
});
