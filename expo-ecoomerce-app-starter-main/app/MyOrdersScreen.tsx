import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    ActivityIndicator,
  } from "react-native";
  import React, { useEffect, useState, useLayoutEffect } from "react";
  import { db, auth } from "@/config/firebase";
  import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
  } from "firebase/firestore";
  import { Colors } from "@/constants/Colors";
  import { useNavigation } from "@react-navigation/native";
  
  const MyOrdersScreen = () => {
    const navigation = useNavigation();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
  
    // Set custom header
    useLayoutEffect(() => {
      navigation.setOptions({
        headerTitle: "My Orders",
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: Colors.primary,
          fontSize: 22,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary, // Set back arrow color
      });
    }, [navigation]);
  
    useEffect(() => {
      const user = auth.currentUser;
      if (!user) return;
  
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
  
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(data);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        }
      );
  
      return () => unsubscribe();
    }, []);
  
    const renderItem = ({ item }: { item: any }) => (
      <View style={styles.orderContainer}>
        <Text style={styles.orderId}>Order ID: {item.id}</Text>
  
        <FlatList
          data={item.items}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Image source={{ uri: item.images?.[0] }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ marginTop: 10 }}
          showsHorizontalScrollIndicator={false}
        />
  
        <Text style={styles.total}>Total: ₪{item.total}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
      </View>
    );
  
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }
  
    if (orders.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You have no orders yet.</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };
  
  export default MyOrdersScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    listContent: {
      padding: 16,
    },
    orderContainer: {
      marginBottom: 20,
      padding: 16,
      backgroundColor: "#fff",
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    orderId: {
      textAlign: "center",
      fontWeight: "bold",
      color: "#333",
      fontSize: 14,
      marginBottom: 8,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
      backgroundColor: "#f9f9f9",
      padding: 8,
      borderRadius: 8,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 10,
    },
    itemDetails: {
      flexDirection: "column",
    },
    itemName: {
      fontSize: 14,
      color: "#444",
      fontWeight: "500",
    },
    itemQty: {
      fontSize: 13,
      color: "#666",
    },
    total: {
      textAlign: "center",
      marginTop: 10,
      fontWeight: "bold",
      fontSize: 15,
      color: "#000",
    },
    status: {
      textAlign: "center",
      color: "#888",
      fontSize: 13,
      marginTop: 4,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 16,
      color: "#888",
    },
  });