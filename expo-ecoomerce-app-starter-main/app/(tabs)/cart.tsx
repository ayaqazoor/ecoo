import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { CartItemType } from '../../types/type';
import { Stack, router } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerHeight = useHeaderHeight();

  const loadCartItems = useCallback(async () => {
    try {
      console.log('Starting to load cart items...');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.log('User not logged in, redirecting to sign in');
        router.push('/signin');
        return;
      }

      console.log('User is logged in:', user.uid);
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', user.uid));
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log('Cart data updated, number of items:', querySnapshot.size);
        const items: CartItemType[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing cart item:', data);
          items.push({
            id: doc.id,
            productId: data.productId,
            title: data.title,
            price: data.price,
            quantity: data.quantity,
            image: data.image
          });
        });
        
        console.log('Setting cart items:', items);
        setCartItems(items);
        setIsLoading(false);
      }, (error) => {
        console.error('Error in cart listener:', error);
        setError('Failed to load cart items');
        setIsLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error in loadCartItems:', error);
      setError('Failed to load cart items');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupListener = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.log('User not logged in, redirecting to sign in');
          router.push('/signin');
          return;
        }

        console.log('User is logged in:', user.uid);
        const cartRef = collection(db, 'carts');
        const q = query(cartRef, where('userId', '==', user.uid));
        
        // Set up real-time listener
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log('Cart data updated, number of items:', querySnapshot.size);
          const items: CartItemType[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Processing cart item:', data);
            items.push({
              id: doc.id,
              productId: data.productId,
              title: data.title,
              price: data.price,
              quantity: data.quantity,
              image: data.image
            });
          });
          
          console.log('Setting cart items:', items);
          setCartItems(items);
          setIsLoading(false);
        }, (error) => {
          console.error('Error in cart listener:', error);
          setError('Failed to load cart items');
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error in setupListener:', error);
        setError('Failed to load cart items');
        setIsLoading(false);
      }
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      console.log('Updating quantity for item:', id, 'to:', newQuantity);
      const docRef = doc(db, 'carts', id);
      await updateDoc(docRef, { 
        quantity: newQuantity,
        updatedAt: new Date()
      });
      console.log('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      console.log('Removing item:', id);
      await deleteDoc(doc(db, 'carts', id));
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading cart items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadCartItems}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerLine} />

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemPrice}>₪{item.price.toFixed(2)}</Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            />
            <View style={styles.footer}>
              <View style={styles.priceInfoWrapper}>
                <Text style={styles.totalText}>Total: ₪{total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => {
                  console.log('Cart items:', cartItems);
                  console.log('Total:', total);
                  router.push({
                    pathname: '/checkout',
                    params: {
                      items: JSON.stringify(cartItems),
                      total: total.toString()
                    }
                  });
                }}
              >
                <Text style={styles.checkoutBtnText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  headerLine: {
    height: 1,
    backgroundColor: '#eee',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: Colors.white,
  },
  priceInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 50,
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: Colors.white,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: Colors.primary,
  },
  removeButton: {
    padding: 5,
  },
});

export default CartScreen;
