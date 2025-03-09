import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios, { Axios } from 'axios'
import { ProductType } from '@/types/type'
import { FlatList } from 'react-native-gesture-handler'

type Props = {}

const HomeScreen = (props: Props) => {
const [products, setproducts] = useState<ProductType[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
useEffect(() => {
  getProducts();

},[]);
  const getProducts =async() => {
    const URL = 'http://localhost:8000/products';
    const response = await axios.get(URL);

    console.log(response.data);
    setproducts(response.data);
    setIsLoading(false);
  }
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <FlatList data={products} keyExtractor={(item) => item.id.toString()} renderItem={({index, item}) => (<Text> {item.title} </Text>)}/>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
});