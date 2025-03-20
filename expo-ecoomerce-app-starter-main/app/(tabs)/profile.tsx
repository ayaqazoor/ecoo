import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

// توليد اسم مستخدم عشوائي
const generateUniqueUsername = () => `user${Date.now()}`;

const ProfileScreen = () => {
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!username) {
      setUsername(generateUniqueUsername());
    }
  }, [username]);

  const options = [
    { id: 1, title: "My Account", icon: "user" as const },
    { id: 2, title: "App Settings", icon: "settings" as const },
    { id: 3, title: "Language Preferences", icon: "globe" as const },
    { id: 4, title: "Help & Support", icon: "help-circle" as const },
    { id: 5, title: "Logout", icon: "log-out" as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/100" }}
            style={styles.profileImage}
          />
          <Feather name="user" size={50} color={Colors.primary} style={styles.userIcon} />
        </View>

        {/* إدخال الاسم */}
        {isEditing ? (
          <TextInput
            style={styles.profileNameInput}
            value={username}
            onChangeText={setUsername}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity
            style={styles.nameContainer}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.profileName}>{username}</Text>
            <Feather name="edit" size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* قائمة الخيارات */}
      <FlatList
        data={options}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.option} activeOpacity={0.7}>
            <Feather name={item.icon} size={22} color={Colors.primary} style={styles.icon} />
            <Text style={styles.optionText}>{item.title}</Text>
            <Feather name="chevron-right" size={22} color={Colors.primary} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  headerBackground: {
    width: "100%",
    height: 150,
    backgroundColor: Colors.beige,
  },
  profileSection: {
    alignItems: "center",
    marginTop: -75,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderColor: Colors.primary,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  userIcon: {
    position: "absolute",
  },
  profileNameInput: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    textAlign: "center",
    paddingVertical: 5,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginRight: 5,
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.beige,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: "92%", // زيادة العرض
    alignSelf: "center",
    marginVertical: 8, // زيادة التباعد بين العناصر
  },
  icon: {
    marginRight: 18,
  },
  optionText: {
    fontSize: 16, // تكبير الخط
    flex: 1,
    fontWeight: "500",
    color: Colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
    width: "100%",
    alignItems: "center",
  },
});

export default ProfileScreen;
