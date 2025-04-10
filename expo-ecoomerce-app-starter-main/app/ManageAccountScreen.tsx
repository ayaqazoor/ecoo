import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { auth } from "@/config/firebase"; // تأكد من أن Firebase تم تهيئته بشكل صحيح
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from 'expo-image-picker'; // استيراد ImagePicker من expo
import { updateProfile } from "firebase/auth"; // دالة تحديث البيانات في Firebase

const ManageAccountScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "User");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || ""); // تعيين صورة الحساب إذا كانت موجودة
    }
  }, []);

  // دالة لاختيار صورة من الجهاز
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setPhotoURL(result.assets[0].uri); // تعيين رابط الصورة باستخدام assets[0].uri
      }
    } else {
      alert("Permission to access gallery is required!");
    }
  };

  // دالة لحفظ التغييرات
  const handleSaveChanges = () => {
    const user = auth.currentUser;
    if (user) {
      // تحديث البيانات مثل الاسم أو الصورة عبر Firebase
      updateProfile(user, {
        displayName: username,
        photoURL: photoURL,
      })
        .then(() => {
          alert("Changes saved successfully!");
        })
        .catch((error: Error) => { // تحديد نوع الـ error هنا
          alert("Error saving changes: " + error.message);
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: photoURL || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{username}</Text>
      </View>

      {/* تغيير الاسم */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* تغيير البريد الإلكتروني */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={false}
        />
      </View>

      {/* خيار تغيير الصورة */}
      <TouchableOpacity style={styles.button} onPress={handlePickImage}>
        <Feather name="camera" size={22} color={Colors.primary} />
        <Text style={styles.buttonText}>Change Profile Photo</Text>
      </TouchableOpacity>

      {/* زر حفظ التغييرات */}
      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.primary,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ManageAccountScreen;
