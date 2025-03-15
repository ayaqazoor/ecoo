import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductType } from '@/types/type';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header'; // تأكدي من استدعاء الهيدر

type Props = {};

const HomeScreen = (props: Props) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    const URL = 'http://192.168.202.177:8000/products';
    const response = await axios.get(URL);
    console.log(response.data);
    setProducts(response.data);
    setIsLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* الهيدر هنا */}
      <Header />

      <SafeAreaView style={styles.container}>
        <Text>Home Screen</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Text>{item.title}</Text>}
        />
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // تغيير الخلفية لتوضيح الفرق بين الهيدر والمحتوى
  },
});
