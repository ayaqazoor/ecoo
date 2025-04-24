import React, { useState, useEffect, useMemo } from 'react';
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { View } from 'react-native';
import AdminPanel from './AdminPanel';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false); // حالة للتحقق إذا كان المستخدم أدمن

  useEffect(() => {
    const checkAdminStatus = async () => {
      const savedRole = await AsyncStorage.getItem('userRole');
      console.log("Saved Role: ", savedRole); // طباعة قيمة الدور في الـ AsyncStorage
      setIsAdmin(savedRole === 'admin'); // التحقق إذا كان المستخدم أدمن
    };

    checkAdminStatus();
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => {
        if (!route?.name) {
          console.error("route.name is undefined:", route);
          return {}; // تجنب تعطل التطبيق
        }

        const iconName = useMemo(() => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: "home-outline",
            explore: "search-outline",
            favorites: "heart-outline", 
            notifications: "notifications-outline",
            cart: "cart-outline",
            profile: "person-outline",
            AdminPanel: "settings-outline", // أيقونة لوحة التحكم للأدمن
          };
          return icons[route.name] || "help-circle-outline";
        }, [route.name]);

        return {
          headerShown: false,
          tabBarActiveTintColor: "#8B5E3C",
          tabBarInactiveTintColor: "#8E8E8E",
          tabBarStyle: {
            backgroundColor: Colors.lightbeige,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderTopWidth: 0,
            shadowColor: Colors.primary,
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 5,
            height: 60,
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 3,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View style={{
                  width: 40,
                  height: 3,
                  backgroundColor: "#8B5E3C",
                  borderRadius: 2,
                  marginBottom: 4,
                }} />
              )}
              <Ionicons name={iconName} size={23} color={color} />
            </View>
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorites" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarBadge: 3 }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      
      {/* فقط إذا كان المستخدم أدمن، يظهر تبويب لوحة التحكم */}
      {isAdmin && <Tabs.Screen name="AdminPanel" options={{ title: "Admin Panel" }} />}
    </Tabs>
  );
}
