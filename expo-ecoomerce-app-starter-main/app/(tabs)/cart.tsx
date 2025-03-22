import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { CartItemType } from '../../types/type';
import axios from 'axios';
import { Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const CartScreen: React.FC = () => {  
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const headerHeight = useHeaderHeight();

  const getCartData = useCallback(async () => {
    try {
      const URL = 'http://192.168.129.177:8000/cart';
      const response = await axios.get(URL);
      console.log('Cart Data response:', response.data);
      
      const uniqueItems = response.data.reduce((acc: CartItemType[], item: CartItemType) => {
        if (!acc.find((el) => el.id === item.id)) {
          acc.push(item);
        }
        return acc;
      }, []);
      
      setCartItems(uniqueItems);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, []);

  useEffect(() => {
    getCartData();
  }, [getCartData]);

  const increaseQuantity = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTransparent: true }} />
      <View style={[styles.container, { marginTop: headerHeight }]}>
        <FlatList 
          data={cartItems} 
          keyExtractor={(item, index) => `${item.id}-${index}`} 
          renderItem={({ item, index }) => ( 
            <CartItem 
              key={`${item.id}-${index}`}
              item={item} 
              increaseQuantity={increaseQuantity} 
              decreaseQuantity={decreaseQuantity} 
              removeItem={removeItem}
            />
          )}
        />   
      </View>
      <View style={styles.footer}>
        <View style={styles.priceInfoWrapper}>
          <Text style={styles.totalText}>
            Total: ₪{cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}
          </Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const CartItem: React.FC<{ 
  item: CartItemType;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  removeItem: (id: number) => void;
}> = ({ item, increaseQuantity, decreaseQuantity, removeItem }) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)}>
      <View style={styles.itemWrapper}>
        <Image source={{ uri: item.image }} style={styles.itemImg} />
        <View style={styles.itemInfoWrapper}>
          <Text style={styles.itemText}>{item.title}</Text>
          <Text style={styles.itemText}>₪ {item.price}</Text>
          <View style={styles.itemcontrolWrapper}>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Ionicons name='trash-outline' size={20} color={'red'} />
            </TouchableOpacity> 
            <View style={styles.quantitycontrolWrapper}> 
              <TouchableOpacity style={styles.quantitycontrol} onPress={() => decreaseQuantity(item.id)}> 
                <Ionicons name='remove-outline' size={20} color={'black'} />
              </TouchableOpacity>
              <Text>{item.quantity}</Text>
              <TouchableOpacity style={styles.quantitycontrol} onPress={() => increaseQuantity(item.id)}> 
                <Ionicons name='add-outline' size={20} color={'black'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Ionicons name='heart-outline' size={20} color={'black'} />
            </TouchableOpacity> 
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
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
    backgroundColor:Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  itemWrapper: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemcontrolWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantitycontrolWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  quantitycontrol: {
    padding: 4,
  },
});

export default CartScreen;
