import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    "Playwrite": require("../assets/fonts/PlaywriteITModerna-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="signup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="TasksScreen" options={{ headerShown: false }} />
        <Stack.Screen name="MorningCareScreen" options={{ headerShown: false }} />
        <Stack.Screen name="OurPoliciesScreen" options={{ headerShown: false }} />
        <Stack.Screen name="ProductsManagement" options={{ headerShown: false }} />
        <Stack.Screen name="Reports" options={{ headerShown: false }} />

      </Stack>
    </GestureHandlerRootView>
  );
}