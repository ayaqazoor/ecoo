import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ProductType } from '@/types/type';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

const FlashSaleScreen = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    loadFlashSaleProducts();
    // Set end date to 9 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 9);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadFlashSaleProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'saleProducts'));
      const productsList: ProductType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.images && data.images.length > 0) {
          productsList.push({
            id: doc.id,
            title: String(data.title || ''),
            price: Number(data.price || 0),
            description: String(data.description || ''),
            images: Array.isArray(data.images) ? data.images : [],
            category: String(data.category || ''),
            categoryId: String(data.categoryId || '0'),
            discount: Number(data.discount || 15),
            originalPrice: Number(data.originalPrice || data.price || 0),
            productType: 'sale' // أضف هذا السطر - يجب أن تتأكد أن النوع مناسب لتعريف ProductType
          });
          
        }
      });
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductItem = ({ item }: { item: ProductType }) => {
    const originalPrice = item.originalPrice || item.price;
    const discount = item.discount || 15; // Fixed 15% discount if not specified
    const discountedPrice = originalPrice - (originalPrice * (discount / 100));

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => router.push(`/product-details/${item.id}?productType=sale`)}
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
            <Text style={styles.currentPrice}>
              ₪{discountedPrice.toFixed(2)}
            </Text>
            <Text style={styles.originalPrice}>
              ₪{originalPrice.toFixed(2)}
            </Text>
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
      <Stack.Screen
        options={{
          headerTitle: 'Flash Sale',
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
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>Sale Ends In:</Text>
          <View style={styles.countdownBoxes}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Days</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Hours</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Mins</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
              <Text style={styles.countdownLabel}>Secs</Text>
            </View>
          </View>
        </View>
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
    overflow: 'hidden',
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
    flexWrap: 'wrap',
    gap: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.gray,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  discountText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  headerButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  countdownContainer: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  countdownTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  countdownBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  countdownBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 6,
    minWidth: 60,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countdownNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  countdownLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default FlashSaleScreen;