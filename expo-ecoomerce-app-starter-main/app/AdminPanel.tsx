import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { checkIfAdmin, addProduct, deleteProduct } from "@/app/utils/adminFunctions";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { collection, getDocs, query, where, getFirestore, orderBy, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: Date;
}

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    dailyOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const admin = await checkIfAdmin();
      setIsAdmin(admin);
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const totalProducts = productsSnapshot.size;

        // Fetch today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ordersQuery = query(
          collection(db, 'orders'),
          where('createdAt', '>=', today)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const dailyOrders = ordersSnapshot.size;

        // Calculate total revenue from today's orders
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          const order = doc.data();
          totalRevenue += order.total || 0;
        });

        // Fetch total users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        setStats({
          totalProducts,
          dailyOrders,
          totalUsers,
          totalRevenue
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        Alert.alert('Error', 'Failed to fetch statistics');
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Order Data:', data); // Debug log
          const order: Order = {
            id: doc.id,
            customerName: data.user?.name || data.customerName || 'غير معروف',
            customerPhone: data.user?.phone || data.customerPhone || 'غير معروف',
            customerAddress: data.user?.address || data.customerAddress || 'غير معروف',
            customerCity: data.user?.city || data.customerCity || 'غير معروف',
            items: Array.isArray(data.items) ? data.items.map((item: any) => ({
              name: typeof item.name === 'string' ? item.name : '',
              price: typeof item.price === 'number' ? item.price : 0,
              quantity: typeof item.quantity === 'number' ? item.quantity : 0,
              images: Array.isArray(item.images) ? item.images : []
            })) : [],
            total: typeof data.total === 'number' ? data.total : 0,
            status: typeof data.status === 'string' ? data.status : 'pending',
            createdAt: data.createdAt?.toDate() || new Date()
          };
          return order;
        });
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Failed to fetch orders');
      }
    };

    if (isAdmin && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAdmin, activeTab]);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        confirmedAt: new Date()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed' }
          : order
      ));

      Alert.alert('Success', 'Order has been confirmed successfully');
    } catch (error) {
      console.error('Error confirming order:', error);
      Alert.alert('Error', 'Failed to confirm order');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>You do not have admin privileges.</Text>
      </View>
    );
  }

  const renderProductsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/AddProduct')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrdersSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Orders Management</Text>
      </View>
      <ScrollView style={styles.ordersList}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            
            <View style={styles.customerInfo}>
              <View style={styles.customerInfoRow}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
                <Text style={styles.customerName}>الاسم: {order.customerName}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
                <Text style={styles.customerPhone}>رقم الهاتف: {order.customerPhone}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <Text style={styles.customerAddress}>العنوان: {order.customerAddress}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Ionicons name="business-outline" size={20} color={Colors.primary} />
                <Text style={styles.customerCity}>المدينة: {order.customerCity}</Text>
              </View>
            </View>

            <View style={styles.productsList}>
              {order.items?.map((item, index) => (
                <View key={index} style={styles.productItem}>
                  <Image 
                    source={{ uri: item.images[0] }} 
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>₪{item.price}</Text>
                    <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.orderSummary}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₪{order.total}</Text>
            </View>

            <View style={styles.orderActions}>
              <View style={styles.orderStatus}>
                <Text style={[
                  styles.statusText,
                  { color: order.status === 'completed' ? 'green' : 'orange' }
                ]}>
                  {order.status || 'pending'}
                </Text>
              </View>
              {order.status !== 'completed' && (
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={() => handleConfirmOrder(order.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Confirm Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Statistics</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cart-outline" size={32} color={Colors.primary} />
          <Text style={styles.statNumber}>{stats.dailyOrders}</Text>
          <Text style={styles.statLabel}>Daily Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={32} color={Colors.primary} />
          <Text style={styles.statNumber}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={32} color={Colors.primary} />
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color={Colors.primary} />
          <Text style={styles.statNumber}>₪{stats.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Admin Dashboard',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.primary} />
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
      <View style={styles.container}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons name="cube-outline" size={24} color={activeTab === 'products' ? '#fff' : Colors.primary} />
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons name="cart-outline" size={24} color={activeTab === 'orders' ? '#fff' : Colors.primary} />
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Ionicons name="stats-chart-outline" size={24} color={activeTab === 'stats' ? '#fff' : Colors.primary} />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Statistics</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'products' && renderProductsSection()}
          {activeTab === 'orders' && renderOrdersSection()}
          {activeTab === 'stats' && renderStatsSection()}
        </ScrollView>
      </View>
    </>
  );
};

export default AdminPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  headerButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  customerInfo: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  customerPhone: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    color: '#333',
  },
  customerAddress: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
    color: '#333',
  },
  customerCity: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    color: '#333',
  },
  productsList: {
    marginBottom: 15,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  orderStatus: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
});
