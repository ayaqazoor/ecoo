import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { checkIfAdmin, addProduct, deleteProduct } from "@/app/utils/adminFunctions"; // استيراد الدوال

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false); // حالة للتحقق إذا كان المستخدم أدمن
  const [loading, setLoading] = useState(true); // حالة لتحميل البيانات من Firestore

  useEffect(() => {
    const checkAdminStatus = async () => {
      const admin = await checkIfAdmin(); // التحقق إذا كان المستخدم "Admin"
      setIsAdmin(admin);
      setLoading(false); // عندما يتم التحقق من حالة المستخدم
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>; // أثناء تحميل البيانات، يظهر نص تحميل
  }

  // إذا لم يكن المستخدم أدمن، عرض رسالة
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You do not have admin privileges.</Text>
      </View>
    );
  }

  // إذا كان المستخدم أدمن، عرض لوحة التحكم
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      <Button title="Add Product" onPress={() => addProduct({ name: "New Product", price: 99.99, description: "This is a new product." })} />
      <Button title="Delete Product" onPress={() => deleteProduct("productId123")} />
    </View>
  );
};

export default AdminPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
