import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useNavigation } from "expo-router";
import { ProductType } from "@/types/type";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // ✅ استيراد الأيقونات
import { Colors } from "@/constants/Colors";

const Favorites = () => {
  const [favorites, setFavorites] = useState<ProductType[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const navigation = useNavigation(); // ✅ لإمكانية الرجوع للخلف

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadCartCount();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      if (storedFavorites) {
        const parsedFavorites: ProductType[] = JSON.parse(storedFavorites);
        const uniqueFavorites = parsedFavorites.filter(
          (item, index, self) => self.findIndex((p) => p.id === item.id) === index
        );
        setFavorites(uniqueFavorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const loadCartCount = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        setCartCount(cartItems.length);
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
    }
  };

  const removeFavorite = async (id: number) => {
    const updatedFavorites = favorites.filter((item) => item.id !== id);
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ الهيدر الخاص بصفحة المفضلة */}
      <View style={styles.header}>
        {/* زر الرجوع للخلف */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#5E4033" />
        </TouchableOpacity>

        <Text style={styles.title}>Favorites </Text>

        {/* زر السلة */}
        <TouchableOpacity onPress={() => router.push("/cart")} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={28} color="#5E4033" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ✅ قائمة المفضلة */}
      <View style={styles.content}>
        {favorites.length === 0 ? (
          <Text style={styles.emptyText}>You haven't added anything yet!</Text>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => router.push(`/product/${item.id}` as any)}
              >
                <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                <Text style={styles.productTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => removeFavorite(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },
  cartButton: {
    position: "relative",
    padding: 5,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 90,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
  },
  productTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  removeText: {
    color: "red",
    fontWeight: "bold",
  },
});
