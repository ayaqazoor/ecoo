import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { db } from '@/config/firebase';
import { collection, query, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  name?: string;
  images?: string[];
}

interface Order {
  id: string;
  status: string;
  userName: string;
  createdAt: Date;
  total: number;
  items: OrderItem[];
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch product details (name, image, price)
  const fetchProductDetails = async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        return {
          name: data.title || 'اسم غير متوفر',  // Default name if not available
          image: data.images && data.images.length > 0 ? data.images[0] : 'defaultImageUrl',  // Fetch first image from images array
          price: data.price || 0,  // Default price if not available
        };
      } else {
        return { name: 'اسم غير متوفر', image: 'defaultImageUrl', price: 0 };  // Default values if product not found
      }
    } catch (e) {
      console.error("Error fetching product details:", e);
      return { name: 'اسم غير متوفر', image: 'defaultImageUrl', price: 0 };  // Default values in case of error
    }
  };

  useEffect(() => {
    const fetchProductName = async (productId: string) => {
      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const data = productSnap.data();
          return data.name || 'اسم غير متوفر';
        }
      } catch (e) {}
      return 'اسم غير متوفر';
    };

    const fetchOrdersWithNames = async () => {
      const q = query(collection(db, 'orders'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const ordersList = await Promise.all(snapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          const itemsWithNames = await Promise.all((data.items || []).map(async (item: any) => {
            const name = await fetchProductName(item.productId || item.id);
            return {
              ...item,
              name,
            };
          }));
          return {
            id: docSnap.id,
            status: data.status || 'Pending',
            userName: data.userName || data.customerName || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            total: data.total || 0,
            items: itemsWithNames,
          };
        }));
        setOrders(ordersList);
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    fetchOrdersWithNames().then(fn => { unsubscribe = fn; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  // Render each order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order # {item.id.substring(0, 8)}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.detailText}>Customer: {item.userName}</Text>
        <Text style={styles.detailText}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.detailText}>Total: ₪{item.total}</Text>
      </View>

      {/* Display products in the order */}
      <View style={styles.productsContainer}>
        <Text style={styles.productsTitle}>Products:</Text>
        {item.items.map((product, index) => (
          <View key={index} style={styles.productItem}>
            {product.images && product.images.length > 0 ? (
              <Image source={{ uri: product.images[0] }} style={styles.productImage} />
            ) : product.image ? (
              <Image source={{ uri: product.image }} style={styles.productImage} />
            ) : null}
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>₪{product.price}</Text>
              <Text style={styles.productQuantity}>Quantity: {product.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {item.status === 'Pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleUpdateStatus(item.id, 'Processing')}
          >
            <Text style={styles.actionButtonText}>Accept Order</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Processing' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleUpdateStatus(item.id, 'Shipped')}
          >
            <Text style={styles.actionButtonText}>Mark as Shipped</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Shipped' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleUpdateStatus(item.id, 'Delivered')}
          >
            <Text style={styles.actionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Determine color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FFA500'; // Orange for Pending
      case 'Processing':
        return '#4169E1'; // Blue for Processing
      case 'Shipped':
        return '#32CD32'; // Green for Shipped
      case 'Delivered':
        return '#008000'; // Dark Green for Delivered
      default:
        return '#000'; // Default color
    }
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  // If there is an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders Management</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.black,
    fontSize: 16,
  },
  list: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  productsContainer: {
    marginTop: 10,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: Colors.primary,
  },
  productQuantity: {
    fontSize: 12,
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
});

export default OrdersManagement;