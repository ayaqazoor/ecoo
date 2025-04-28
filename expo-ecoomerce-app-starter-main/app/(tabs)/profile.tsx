import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Switch } from "react-native";
import React, { useState, useEffect } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { auth, db } from "@/config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from "expo-router";

type Option = {
  title: string;
  icon: keyof typeof Feather.glyphMap;
};

const options: Option[] = [
  { title: "Manage Account", icon: "user" },
  { title: "Notifications", icon: "bell" },
  { title: "Language", icon: "globe" },
  { title: "Dark Mode", icon: "moon" },
  { title: "Logout", icon: "log-out" },
];

const ProfileScreen = () => {
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsername(user.displayName || user.email || "User");
        setPhotoURL(user.photoURL);
        
        // التحقق من دور المستخدم في Firebase
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          console.log("User Data:", userData); // للتأكد من البيانات
          setIsAdmin(userData?.role === 'admin');
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOptionPress = (item: Option) => {
    if (item.title === "Logout") {
      handleLogout();
    } else if (item.title === "Dark Mode") {
      setIsDarkMode((prev) => !prev);
    } else if (item.title === "Manage Account") {
      router.push("/ManageAccountScreen");
    } else {
      console.log(`Navigating to ${item.title}`);
    }
  };

  const handleAdminPanelPress = () => {
    router.push('/AdminPanel');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={
          photoURL
            ? { uri: photoURL }
            : require("@/assets/images/accnotf.jpeg")
        }
        style={styles.avatar}
      />
      <Text style={styles.username}>{username}</Text>
    </View>
  );

  const renderAdminButton = () => (
    isAdmin && (
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={handleAdminPanelPress}
      >
        <Ionicons name="settings-outline" size={24} color="#8B5E3C" />
        <Text style={styles.adminButtonText}>Admin Panel</Text>
      </TouchableOpacity>
    )
  );

  const renderItem = ({ item }: { item: Option }) => (
    <TouchableOpacity
      style={styles.option}
      activeOpacity={0.7}
      onPress={() => handleOptionPress(item)}
    >
      <Feather name={item.icon} size={22} color={Colors.primary} style={styles.icon} />
      <Text style={styles.optionText}>{item.title}</Text>
      {item.title === "Dark Mode" ? (
        <Switch
          value={isDarkMode}
          onValueChange={() => setIsDarkMode((prev) => !prev)}
        />
      ) : (
        <Feather name="chevron-right" size={22} color={Colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={options}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderAdminButton}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.primary,
  },
  list: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  adminButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#8B5E3C',
    fontWeight: '600',
  },
});
