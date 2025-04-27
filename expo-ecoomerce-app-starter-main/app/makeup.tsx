import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ProductType } from '@/types/type';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

const MakeupScreen = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMakeupProducts();
  }, []);

  const loadMakeupProducts = async () => {
    try {
      console.log('Starting to fetch makeup products...');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category.id', '==', 5));
      const querySnapshot = await getDocs(q);
      
      console.log(`Found ${querySnapshot.size} makeup products`);
      
      if (querySnapshot.empty) {
        console.log('No makeup products found');
        setError('No makeup products found');
        return;
      }

      const productsList: ProductType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing product:', data);
        
        productsList.push({
          id: doc.id,
          title: String(data.title || ''),
          price: Number(data.price || 0),
          description: String(data.description || ''),
          images: Array.isArray(data.images) ? data.images : [],
          category: String(data.category?.name || ''),
          categoryId: String(data.category?.id || ''),
          discount: Number(data.discount || 0),
          originalPrice: Number(data.originalPrice || data.price || 0)
        });
      });

      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching makeup products:', error);
      setError('Failed to load makeup products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (productId: string) => {
    console.log('Navigating to product details:', productId);
    router.push({
      pathname: '/product-details/[id]',
      params: { 
        id: productId,
        productType: 'regular',
        category: 'Makeup'
      }
    });
  };

  const renderProductItem = ({ item }: { item: ProductType }) => {
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(item.id)}
      >
        <Image
          source={{ uri: item.images[0] }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ₪{item.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadMakeupProducts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No makeup products available</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Makeup',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/cart')}
            >
              <Ionicons name="cart-outline" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.primary,
          },
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  productItem: {
    flex: 1,
    margin: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  headerButton: {
    marginHorizontal: 10,
    padding: 5,
  },
});

export default MakeupScreen; 