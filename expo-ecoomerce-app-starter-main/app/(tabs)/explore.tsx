import React from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import Header from "@/components/Header";

const categories = [
  { id: 1, title: "Perfumes", image: require("@/assets/images/Perf.jpeg") },
  { id: 2, title: "Accessories", image: require("@/assets/images/acc.jpeg") },
  { id: 3, title: "Skincare", image: require("@/assets/images/skin.jpeg") },
  
];

const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Image source={item.image} style={styles.image} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0, // تأكد من عدم وجود مسافات جانبية
  },
  headerContainer: {
    width: "100%", 
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "space-between",
    marginTop: 10 ,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
});

export default ExploreScreen;