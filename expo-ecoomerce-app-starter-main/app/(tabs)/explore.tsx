import { FlatList, StyleSheet, Text, View, Dimensions, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CategoryType } from '@/types/type'
import { Stack, router } from 'expo-router'
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from 'react-native';
import { Colors } from '@/constants/Colors'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const ExploreScreen = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const headerHeight = useHeaderHeight();

  const getCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesCollection = collection(db, 'categories');
      const q = query(categoriesCollection, orderBy('id'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot || querySnapshot.empty) {
        setCategories([]);
        return;
      }
      
      const categoriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          image: data.image
        };
      });
      
      setCategories(categoriesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getCategories();
  }, []);

  const renderCategoryCard = ({ item }: { item: CategoryType }) => {
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => {
          switch (item.name) {
            case 'Skin Care':
              router.push('/skinCare');
              break;
            case 'Hair Care':
              router.push('/hairCare');
              break;
            case 'Makeup':
              router.push('/makeup' as any);
              break;
            case 'Fragrance':
              router.push('/fragrance' as any);
              break;
            case 'Body Care':
              router.push('/bodyCare' as any);
              break;
            case 'Men':
              router.push('/men' as any);
              break;
            case 'Perfumes':
              router.push('/perfumes' as any);
              break;
            case 'Hand Bags':
              router.push('/handBag' as any);
              break;
            case 'Accessories':
              router.push('/accessories' as any);
              break;
            case 'Watches':
              router.push('/watches' as any);
              break;
            case 'Gift':
              router.push('/gift' as any);
              break;
            default:
              break;
          }
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.categoryImage}
        />
        <Text style={styles.categoryTitle}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={getCategories}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { marginTop: headerHeight }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore</Text>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerLine} />
        <View style={styles.contentContainer}>
          <FlatList
            data={categories}
            keyExtractor={(item) => `category-${item.id}`}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
              />
            }
            renderItem={renderCategoryCard}
          />
        </View>
      </View>
    </>
  );
};

export default ExploreScreen;

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
    color: Colors.pink,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 10,
  },
  card: {
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
  categoryImage: {
    width: CARD_WIDTH - 20,
    height: CARD_WIDTH - 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 20,
    color: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    marginTop: 20,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  headerLine: {
    height: 0.8,
    backgroundColor: Colors.lightGray,
    width: '100%',
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    width: CARD_WIDTH,
    marginBottom: 20,
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
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
});