import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ProductType } from '@/types/type';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const PerfumesScreen = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerfumesProducts();
  }, []);

  const loadPerfumesProducts = async () => {
    try {
      console.log('Starting to fetch perfumes products...');
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category.id', '==', 7));
      const querySnapshot = await getDocs(q);
      
      console.log(`Found ${querySnapshot.size} perfumes products`);
      
      if (querySnapshot.empty) {
        console.log('No perfumes products found');
        setError('No perfumes products found');
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
      console.error('Error fetching perfumes products:', error);
      setError('Failed to load perfumes products');
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
        category: 'Perfumes'
      }
    });
  };

  const renderProductItem = ({ item }: { item: ProductType }) => {
    return (
      <TouchableOpacity
        style={styles.productCard}
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
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadPerfumesProducts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No perfumes products available</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Perfumes',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/explore')}
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
        <View style={styles.contentContainer}>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.black,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
  },
  errorText: {
    color: Colors.primary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.extraLightGray,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: CARD_WIDTH - 20,
    height: CARD_WIDTH - 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  productInfo: {
    width: '100%',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

export default PerfumesScreen; 