import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductType } from '@/types/type';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductItem from '@/components/ProductItem';
import { Colors } from '@/constants/Colors';

type Props = {
    products: ProductType[],
    flatlist: boolean ,
    

};

const ProductList = ({products, flatlist= true}: Props) => {
      const [product, setProducts] = useState<ProductType[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      getProducts();
    }, []);
  
    const getProducts = async () => {
      try {
        const URL = 'http://192.168.212.177:8000/products';
        const response = await axios.get(URL);
        console.log('Fetched Products:', response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
  return (
   
         <SafeAreaView style={styles.container}>
           <View style={styles.titlewrapper}> 
           <Text style={styles.title}>For You </Text>
           <TouchableOpacity>
             <Text style={styles.titleBtn}> See All </Text>
           </TouchableOpacity>
           </View>
           {flatlist ? (
            <FlatList
            data={products}
            numColumns={2}
            contentContainerStyle={{justifyContent: 'space-between' , marginBottom: 20}}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={({index, item }) => (
              <ProductItem item={item} index={index} />
            )}
            /> 
            ): (
              <View style={styles.itemsWrapper}> 
                {products.map((item, index) => (
                  <View key={index} style={styles.productWrapper}>
                <ProductItem item={item} index={index} />
              </View>
            ))}
          </View>
            )}
            </SafeAreaView>
           
  )
}

export default ProductList;

const styles = StyleSheet.create({
    container: {
        marginHorizontal:25,
         padding: 1,
         borderRadius: 20,
         shadowColor: Colors.primary,
         shadowOpacity: 0.1,
         shadowRadius: 20,
       },
       titlewrapper:{
       flexDirection: 'row',
       justifyContent: 'space-between',
       marginBottom: 10,
     
       },
       titleBtn:{
       fontSize: 14,
       fontWeight: '500',
       letterSpacing: 0.6,
       color: Colors.primary,
     
       },
       title: {
       fontSize: 18,
       fontWeight: '600',
       letterSpacing: 0.6,
       color: Colors.primary,
       },
       itemsWrapper:{
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'stretch',
       },

      productWrapper:{
      width: '50%',
      paddingLeft: 5,
      marginBottom: 20,

       },
});