import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

type Props = {};

const HomeScreen = (props: Props) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [saleProducts, setSaleProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Products updated:', products);
    console.log('Sale products updated:', saleProducts);
  }, [products, saleProducts]);

  const fetchData = async () => {
    try {
      console.log('Starting to fetch all data...');
      setIsLoading(true);
      await Promise.all([
        getProducts(),
        getCategories(),
        getSaleProducts()
      ]);
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      console.log('Starting to fetch products from Firebase...');
      const productsCollection = collection(db, 'products');
      const snapshot = await getDocs(productsCollection);
      
      if (snapshot.empty) {
        console.log('No products found in Firebase');
        return;
      }

      console.log(`Found ${snapshot.docs.length} products`);
      
      const productsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`Processing product:`, data);
        
        return {
          id: doc.id,
          title: data.title || 'Untitled Product',
          price: Number(data.price) || 0,
          description: data.description || 'No description available',
          images: Array.isArray(data.images) ? data.images : [],
          category: data.category || 'Uncategorized'
        } as ProductType;
      });

      console.log('All products processed:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error in getProducts:', error);
    }
  };

  const getCategories = async () => {
    try {
      const categoriesCollection = collection(db, 'categories');
      const snapshot = await getDocs(categoriesCollection);
      const categoriesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          image: data.image || ''
        } as CategoryType;
      });
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getSaleProducts = async () => {
    try {
      console.log('Starting to fetch sale products from Firebase...');
      const saleProductsCollection = collection(db, 'saleProducts');
      const snapshot = await getDocs(saleProductsCollection);
      
      if (snapshot.empty) {
        console.log('No sale products found in Firebase');
        return;
      }

      console.log(`Found ${snapshot.docs.length} sale products`);
      
      const saleProductsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`Processing sale product:`, data);
        
        return {
          id: doc.id,
          title: data.title || 'Untitled Sale Product',
          price: Number(data.price) || 0,
          description: data.description || 'No description available',
          images: Array.isArray(data.images) ? data.images : [],
          category: data.category || 'Uncategorized'
        } as ProductType;
      });

      console.log('All sale products processed:', saleProductsData);
      setSaleProducts(saleProductsData);
    } catch (error) {
      console.error('Error in getSaleProducts:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSaleProducts = saleProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Image 
            source={require('@/assets/images/mhh.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionContainer}>
            <Categories categories={categories} />
          </View>

          <View style={styles.sectionContainer}>
            <FlashSale products={filteredSaleProducts} />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Routine</Text>
              <TouchableOpacity onPress={() => router.push('../routine/TasksScreen')}>
                <Text style={styles.sectionTitle}>See All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.routineCard, { backgroundColor: Colors.lightbeige }]}
              onPress={() => router.push('../routine/TasksScreen')}
            >
              <Image 
                source={require('@/assets/images/routine.jpeg')} 
                style={styles.routineImage}
                resizeMode="cover"
              />
              <View style={styles.routineContent}>
                <Text style={styles.routineTitle}>Your Daily Skin Care</Text>
                <Text style={styles.routineDescription}>
                  Follow our expert tips for healthy and glowing skin
                </Text>
                <View style={styles.routineFooter}>
                  <View style={[styles.routineBadge, { backgroundColor: Colors.primary }]}>
                    <Ionicons name="time-outline" size={16} color={Colors.white} />
                    <Text style={[styles.routineBadgeText, { color: Colors.white }]}>Daily</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={Colors.gray} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <ProductList products={filteredProducts} flatlist={false} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 10,
    gap: 15,
    backgroundColor: Colors.lightbeige,
  },
  logo: {
    width: 80,
    height: 70,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  routineCard: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routineImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    padding: 10 , 
    borderRadius:30,
  },
  routineContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 5,
  },
  routineDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  routineBadgeText: {
    color: Colors.primary,
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  
});

export default HomeScreen;