import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { ProductType } from '@/types/type';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductItem from '@/components/ProductItem';
import { Colors } from '@/constants/Colors';

type Props = {
    products: ProductType[];
    flatlist: boolean;
};

const ProductList = ({ products, flatlist = true }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titlewrapper}>
        <Text style={styles.title}>For You</Text>
        <TouchableOpacity>
          <Text style={styles.titleBtn}>See All</Text>
        </TouchableOpacity>
      </View>
      {flatlist ? (
        <FlatList
          data={products}
          numColumns={2}
          contentContainerStyle={{ justifyContent: 'space-between', marginBottom: 20 }}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ index, item }) => (
            <ProductItem item={item} index={index} productType={'regular'} />
          )}
        />
      ) : (
        <View style={styles.itemsWrapper}>
          {products.map((item, index) => (
            <View key={index} style={styles.productWrapper}>
              <ProductItem item={item} index={index} productType={'regular'} />
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    padding: 1,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  titlewrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleBtn: {
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
  itemsWrapper: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  productWrapper: {
    width: '50%',
    paddingLeft: 6,
    paddingRight: 7,
    marginBottom: 20,
  },
});