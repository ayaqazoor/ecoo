import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ScrollView } from 'react-native';
import Categories from '@/components/Categories';
import ProductList from '@/components/ProductList';
import { CategoryType, ProductType } from '@/types/type';

type Props = {};

const CATEGORY_MAPPINGS: CategoryType[] = [
  { id: '5', name: 'Makeup', image: '' },
  { id: '1', name: 'Body Care', image: '' },
  { id: '6', name: 'Hair Care', image: '' },
  { id: '2', name: 'Skin Care', image: '' },
  { id: '4', name: 'Handbags', image: '' },
  { id: '9', name: 'Gifts', image: '' },
  { id: '7', name: 'Perfumes', image: '' },
  { id: '3', name: 'Accessories', image: '' },
  { id: '8', name: 'Watches', image: '' },
];

const HomeScreen = (props: Props) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [saleProducts, setSaleProducts] = useState<ProductType[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update max price when products or sale products change
  useEffect(() => {
    const allPrices = [...products, ...saleProducts].map(p => p.price);
    const newMaxPrice = Math.ceil(Math.max(...allPrices, 1000));
    setMaxPrice(newMaxPrice);
    setPriceRange([0, newMaxPrice]);
  }, [products, saleProducts]);

  // Log category selection and filtered products for debugging
  useEffect(() => {
    console.log('Selected Category ID:', selectedCategoryId);
    console.log('Available Category IDs:', CATEGORY_MAPPINGS.map(c => ({ id: c.id, name: c.name })));
    if (selectedCategoryId) {
      const filteredCount = products.filter(p => p.categoryId === selectedCategoryId).length +
                           saleProducts.filter(p => p.categoryId === selectedCategoryId).length +
                           flashSaleProducts.filter(p => p.categoryId === selectedCategoryId).length;
      console.log(`Products in category ${selectedCategoryId}: ${filteredCount}`);
      // Log products with mismatched or undefined categoryId
      const mismatchedProducts = [...products, ...saleProducts, ...flashSaleProducts].filter(p => p.categoryId && !CATEGORY_MAPPINGS.some(c => c.id === p.categoryId));
      const undefinedCategoryProducts = [...products, ...saleProducts, ...flashSaleProducts].filter(p => !p.categoryId);
      console.log('Products with invalid categoryId:', mismatchedProducts.map(p => ({ id: p.id, categoryId: p.categoryId })));
      console.log('Products with undefined categoryId:', undefinedCategoryProducts.map(p => ({ id: p.id })));
    }
  }, [selectedCategoryId, products, saleProducts, flashSaleProducts]);

  // Fetch all data from Firebase
  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        getProducts(),
        getSaleProducts(),
        loadFlashSaleProducts(),
      ]);
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to normalize productType
  const normalizeProductType = (productType: string | number | (string | number)[] | null | undefined): string => {
    if (productType === null || productType === undefined) return 'unknown';
    if (Array.isArray(productType)) return String(productType[0] || 'unknown');
    return String(productType);
  };

  // Fetch products from Firebase
  const getProducts = async () => {
    try {
      const productsCollection = collection(db, 'products');
      const snapshot = await getDocs(productsCollection);

      if (snapshot.empty) {
        console.log('No products found in Firebase "products" collection');
        return;
      }

      const productsData: ProductType[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📄 Raw product data:', { id: doc.id, ...data });
        console.log('🔍 category.id type:', typeof data.category?.id, 'value:', data.category?.id);

        const categoryId = data.category?.id ? String(data.category.id) : 'uncategorized';
        const categoryName = data.category?.name || CATEGORY_MAPPINGS.find(c => c.id === categoryId)?.name || 'Uncategorized';

        return {
          id: doc.id,
          title: data.title || data.name || 'Untitled Product',
          price: Number(data.price) || 0,
          description: data.description || 'No description available',
          images: Array.isArray(data.images) ? data.images : [],
          category: categoryName,
          categoryId,
          discount: Number(data.discount) || 0,
          originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
          productType: normalizeProductType(data.productType),
          stock: Number(data.stock) || 0,
        };
      });

      setProducts(productsData);
      console.log('📊 Product Category IDs:', productsData.map(p => ({ id: p.id, categoryId: p.categoryId })));
    } catch (error) {
      console.error('Error in getProducts:', error);
    }
  };

  // Fetch sale products from Firebase
  const getSaleProducts = async () => {
    try {
      const saleProductsCollection = collection(db, 'saleProducts');
      const snapshot = await getDocs(saleProductsCollection);

      if (snapshot.empty) {
        console.log('No sale products found in Firebase "saleProducts" collection');
        return;
      }

      const saleProductsData: ProductType[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📄 Raw sale product data:', { id: doc.id, ...data });
        console.log('🔍 category.id type:', typeof data.category?.id, 'value:', data.category?.id);

        const categoryId = data.category?.id ? String(data.category.id) : 'uncategorized';
        const categoryName = data.category?.name || CATEGORY_MAPPINGS.find(c => c.id === categoryId)?.name || 'Uncategorized';

        return {
          id: doc.id,
          title: data.title || data.name || 'Untitled Sale Product',
          price: Number(data.price) || 0,
          description: data.description || 'No description available',
          images: Array.isArray(data.images) ? data.images : [],
          category: categoryName,
          categoryId,
          discount: Number(data.discount) || 0,
          originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
          productType: normalizeProductType(data.productType),
          stock: Number(data.stock) || 0,
        };
      });

      setSaleProducts(saleProductsData);
      console.log('📊 Sale Product Category IDs:', saleProductsData.map(p => ({ id: p.id, categoryId: p.categoryId })));
    } catch (error) {
      console.error('Error in getSaleProducts:', error);
    }
  };

  // Fetch flash sale products from Firebase
  const loadFlashSaleProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'saleProducts'));

      if (querySnapshot.empty) {
        console.log('No flash sale products found in Firebase "saleProducts" collection');
        return;
      }

      const productsList: ProductType[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          console.log('📄 Raw flash sale product data:', { id: doc.id, ...data });
          console.log('🔍 category.id type:', typeof data.category?.id, 'value:', data.category?.id);

          if (data && data.images && data.images.length > 0) {
            const categoryId = data.category?.id ? String(data.category.id) : 'uncategorized';
            const categoryName = data.category?.name || CATEGORY_MAPPINGS.find(c => c.id === categoryId)?.name || 'Uncategorized';

            return {
              id: doc.id,
              title: String(data.title || data.name || ''),
              price: Number(data.price || 0),
              description: String(data.description || ''),
              images: Array.isArray(data.images) ? data.images : [],
              category: categoryName,
              categoryId,
              discount: Number(data.discount || 0),
              originalPrice: Number(data.originalPrice || data.price || 0),
              productType: normalizeProductType(data.productType),
              stock: Number(data.stock) || 0,
            } as ProductType;
          }
          return null;
        })
        .filter((item) => item !== null) as ProductType[];

      setFlashSaleProducts(productsList);
      console.log('📊 Flash Sale Product Category IDs:', productsList.map(p => ({ id: p.id, categoryId: p.categoryId })));
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
    }
  };

  // Filter products based on search query, price range, and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCategory = selectedCategoryId
      ? product.categoryId === selectedCategoryId
      : true;
    return matchesSearch && matchesPrice && matchesCategory;
  });

  const filteredSaleProducts = saleProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCategory = selectedCategoryId
      ? product.categoryId === selectedCategoryId
      : true;
    return matchesSearch && matchesPrice && matchesCategory;
  });

  const filteredFlashSaleProducts = flashSaleProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCategory = selectedCategoryId
      ? product.categoryId === selectedCategoryId
      : true;
    return matchesSearch && matchesPrice && matchesCategory;
  });

  // Render flash sale item
  const renderFlashSaleItem = ({ item }: { item: ProductType }) => {
    const originalPrice = item.originalPrice || item.price;
    const discount = item.discount || 15; // Use item.discount if available, else fallback to 15%
    const discountedPrice = originalPrice - (originalPrice * (discount / 100));

    return (
      <TouchableOpacity
        style={styles.flashSaleItem}
        onPress={() => router.push(`/product-details/${item.id}?productType=${normalizeProductType(item.productType)}`)}
      >
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.flashSaleImage} />
        ) : (
          <View style={[styles.flashSaleImage, { backgroundColor: Colors.lightGray }]} />
        )}
        <View style={styles.flashSaleInfo}>
          <Text style={styles.flashSaleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₪{discountedPrice.toFixed(2)}</Text>
            <Text style={styles.originalPrice}>₪{originalPrice.toFixed(2)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
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
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSearching(text.length > 0);
              }}
            />
            {isSearching && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="filter" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter Products</Text>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>
                Price Range: ₪{priceRange[0].toFixed(0)} - ₪{priceRange[1].toFixed(0)}
              </Text>
              <Slider
                style={styles.priceSlider}
                minimumValue={0}
                maximumValue={maxPrice}
                step={10}
                value={priceRange[1]}
                onValueChange={(value) => setPriceRange([priceRange[0], value])}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.gray}
                thumbTintColor={Colors.primary}
              />
              <View style={styles.priceRangeInputs}>
                <TextInput
                  style={styles.priceInput}
                  value={priceRange[0].toString()}
                  onChangeText={(text) => {
                    const value = Number(text) || 0;
                    setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                  }}
                  keyboardType="numeric"
                  placeholder="Min"
                />
                <Text style={styles.priceDash}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  value={priceRange[1].toString()}
                  onChangeText={(text) => {
                    const value = Number(text) || maxPrice;
                    setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                  }}
                  keyboardType="numeric"
                  placeholder="Max"
                />
              </View>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <TouchableOpacity
                  style={[styles.categoryButton, !selectedCategoryId && styles.categoryButtonSelected]}
                  onPress={() => setSelectedCategoryId(null)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      !selectedCategoryId && styles.categoryButtonTextSelected,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {CATEGORY_MAPPINGS.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategoryId === category.id && styles.categoryButtonSelected,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategoryId === category.id && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {isSearching || showFilters ? (
            <View style={styles.sectionContainer}>
              {products.length === 0 && saleProducts.length === 0 && flashSaleProducts.length === 0 ? (
                <Text style={styles.noProductsText}>
                  No products available. Please add products to the Firebase "products" or "saleProducts" collections.
                </Text>
              ) : filteredProducts.length === 0 && filteredSaleProducts.length === 0 && filteredFlashSaleProducts.length === 0 ? (
                <Text style={styles.noProductsText}>
                  No products found for this category. Ensure product category IDs match categories defined.
                </Text>
              ) : (
                <ProductList
                  products={[...filteredProducts, ...filteredSaleProducts, ...filteredFlashSaleProducts].map(p => ({
                    ...p,
                    productType: normalizeProductType(p.productType),
                  }))}
                  flatlist={false}
                />
              )}
            </View>
          ) : (
            <>
              <View style={styles.sectionContainer}>
                <Categories categories={CATEGORY_MAPPINGS} />
              </View>

              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Flash Sale</Text>
                  <TouchableOpacity onPress={() => router.push('/flashSale')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={flashSaleProducts}
                  renderItem={renderFlashSaleItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.flashSaleList}
                />
              </View>

              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Daily Routine</Text>
                  <TouchableOpacity onPress={() => router.push('../routine/TasksScreen')}>
                    <Text style={styles.seeAllText}>See All</Text>
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
                {products.length === 0 && saleProducts.length === 0 ? (
                  <Text style={styles.noProductsText}>
                    No products available. Please add products to the Firebase "products" or "saleProducts" collections.
                  </Text>
                ) : (
                  <ProductList
                    products={filteredProducts.map(p => ({
                      ...p,
                      productType: normalizeProductType(p.productType),
                    }))}
                    flatlist={false}
                  />
                )}
              </View>
            </>
          )}
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
    gap: 10,
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
    shadowOffset: { width: 0, height: 2 },
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
  clearButton: {
    marginLeft: 10,
  },
  filterButton: {
    padding: 10,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 10,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 5,
  },
  priceSlider: {
    width: '100%',
    height: 40,
  },
  priceRangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  priceDash: {
    fontSize: 16,
    color: Colors.gray,
  },
  categoryScroll: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.black,
  },
  categoryButtonTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  noCategoriesText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 10,
  },
  noProductsText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginVertical: 20,
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
    fontWeight: '600',
    color: Colors.primary,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  routineCard: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routineImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
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
  flashSaleItem: {
    width: 150,
    marginRight: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flashSaleImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  flashSaleInfo: {
    flex: 1,
  },
  flashSaleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 10,
    color: Colors.gray,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  flashSaleList: {
    paddingHorizontal: 16,
  },
});

export default HomeScreen;