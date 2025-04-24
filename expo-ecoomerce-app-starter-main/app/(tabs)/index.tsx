import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CategoryType, ProductType } from '@/types/type';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import ProductItem from '@/components/ProductItem';
import { Colors } from '@/constants/Colors';
import ProductList from '@/components/ProductList';
import Categories from '@/components/Categories';
import FlashSale from '@/components/FlashSale';
import { ScrollView } from 'react-native-gesture-handler';

type Props = {};

const HomeScreen = (props: Props) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [SaleProducts, setSaleProducts] = useState<ProductType[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getProducts();
    getCategories();
    getSaleProducts();
  }, []);

  const getProducts = async () => {
    try {
      const URL = 'http://192.168.112.177:8000/products';
      const response = await axios.get(URL, { timeout: 10000 });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const getCategories = async () => {
    try {
      const URL = 'http://192.168.112.177:8000/categories';
      const response = await axios.get(URL, { timeout: 10000 });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSaleProducts = async () => {
    try {
      const URL = 'http://192.168.112.177:8000/saleProducts';
      const response = await axios.get(URL, { timeout: 10000 });
      setSaleProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if( isLoading) {
    return (
      <View> 
        <ActivityIndicator size={'large'} />
      </View>
    )
  }
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header />
      <ScrollView > 
      <Categories categories={categories} />
      <FlashSale products={SaleProducts} /> 
      <TouchableOpacity
onPress={() => router.push('../routine/TasksScreen') // باستخدام .. للتنقل إلى الأعلى
}

  style={styles.taskButton}
>
  <Image
    source={require('@/assets/images/routine.jpeg')}
    style={styles.taskImage}
  />
  <Text style={styles.taskText}>Start Your Daily SkinCare Routine✨</Text>
</TouchableOpacity>

      <View style={{marginHorizontal: 20, marginBottom: 10 }}> 
        <Image source={require('@/assets/images/flashsale.png')} style={{ width: '100%' , height: 210 , borderRadius: 15 }}/>
      </View>
       
      <ProductList products={products} flatlist={false}/> 
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  taskButton: {
    backgroundColor: Colors.lightbeige,
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  taskImage: {
    width: 70,
    height: 70,
    marginRight: 15,
    borderRadius: 30,
  },
  taskText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
  },
});