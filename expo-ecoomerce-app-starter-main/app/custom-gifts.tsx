import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

interface ProductType {
  id: string;
  name: string;
  title: string;
  price: number;
  images: string[];
  category: {
    id: number;
    name: string;
  };
}

const CustomGiftsScreen = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [giftBoxes, setGiftBoxes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<ProductType[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadCustomGifts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setVisibleProducts(products.slice(0, visibleCount));
    }
  }, [products, visibleCount]);

  const loadCustomGifts = async () => {
    try {
      console.log('Fetching custom gifts...');
      const productsRef = collection(db, 'products');
      
      const categoryIds = [1, 2, 3, 4, 5, 6, 7, 8];
      const promises = categoryIds.map((categoryId) => {
        const q = query(
          productsRef,
          where('category.id', '==', categoryId),
          limit(6)
        );
        return getDocs(q);
      });

      const q10 = query(
        productsRef,
        where('category.id', '==', 10)
      );
      const querySnapshot10 = await getDocs(q10);
      
      const regularProducts: ProductType[] = [];
      const giftBoxProducts: ProductType[] = [];

      const querySnapshots = await Promise.all(promises);
      querySnapshots.forEach((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          regularProducts.push({
            id: doc.id,
            name: String(data.name || ''),
            title: String(data.title || ''),
            price: Number(data.price || 0),
            images: Array.isArray(data.images) ? data.images : [],
            category: {
              id: Number(data.category?.id || 0),
              name: String(data.category?.name || ''),
            },
          });
        });
      });

      querySnapshot10.forEach((doc) => {
        const data = doc.data();
        giftBoxProducts.push({
          id: doc.id,
          name: String(data.name || ''),
          title: String(data.title || ''),
          price: Number(data.price || 0),
          images: Array.isArray(data.images) ? data.images : [],
          category: {
            id: Number(data.category?.id || 0),
            name: String(data.category?.name || ''),
          },
        });
      });

      setProducts(regularProducts);
      setGiftBoxes(giftBoxProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 4);
      setLoadingMore(false);
    }, 500);
  };

  const handleProductPress = (productId: string) => {
    console.log('Navigating to product details:', productId);
    router.push({
      pathname: '/product-details/[id]',
      params: { 
        id: productId,
        productType: 'custom',
        category: 'Gift'
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
            {item.title || item.name}
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
          onPress={loadCustomGifts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Customize Gifts',
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
        <ScrollView style={styles.scrollView}>
          {/* المنتجات العادية */}
          <View style={styles.gridContainer}>
            {visibleProducts.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                {renderProductItem({ item })}
              </View>
            ))}
          </View>

          {/* Load More Button */}
          {visibleCount < products.length && (
            <View style={styles.loadMoreContainer}>
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.loadMoreText}>Load More</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* الفاصل */}
          {giftBoxes.length > 0 && (
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>
                Choose Your Perfect Gift Box
              </Text>
              <View style={styles.separatorLine} />
            </View>
          )}

          {/* بوكسات الهدايا */}
          <View style={styles.gridContainer}>
            {giftBoxes.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                {renderProductItem({ item })}
              </View>
            ))}
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
  errorContainer: {
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
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
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
    padding: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
    textAlign: 'left',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  separator: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary,
    marginHorizontal: 10,
  },
  separatorText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  loadMoreText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomGiftsScreen;