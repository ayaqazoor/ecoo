import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { checkIfAdmin, addProduct, deleteProduct } from "@/app/utils/adminFunctions";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { collection, getDocs, query, where, getFirestore, orderBy, updateDoc, doc, Timestamp, getDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Utility function to send notification
const sendNotification = async (toToken: string, title: string, body: string, userId: string, orderId?: string) => {
  const db = getFirestore();
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      orderId: orderId || null,
      createdAt: Timestamp.fromDate(new Date()),
      status: 'pending',
    });
    console.log('Notification saved to Firestore:', { userId, title, body, orderId });

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toToken,
        sound: 'default',
        title,
        body,
        priority: 'high',
        data: { orderId: orderId || '' },
      }),
    });

    const result = await response.json();
    console.log('Push notification response:', result);
    if (result.errors) {
      console.error('Push notification errors:', result.errors);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Send order confirmation notification
const sendOrderConfirmationNotification = async (userId: string, orderId: string) => {
  const db = getFirestore();
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.log('User not found');
      return;
    }

    const userData = userDoc.data();
    const userToken = userData.expoPushToken;

    if (userToken) {
      await sendNotification(
        userToken,
        'تم تأكيد طلبيتك',
        'تم تأكيد طلبيتك وستصل خلال 2-3 أيام عمل.',
        userId,
        orderId
      );
      console.log('Order confirmation notification sent to user:', userId);
    } else {
      console.log('No expoPushToken found for user:', userId);
    }
  } catch (error) {
    console.error('Error sending order confirmation notification:', error);
  }
};

// Styles and interfaces remain unchanged
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
    fontSize: 14,
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
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 10,
    gap: 10,
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
    width: '100%',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 20,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  reportsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    direction: 'ltr',
  },
  reportsHeader: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGray,
    alignItems: 'flex-start',
  },
  reportsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: Colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 15,
    backgroundColor: Colors.white,
    marginTop: 10,
    gap: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.lightbeige,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.black,
    textAlign: 'left',
  },
  reportsStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 20,
    gap: 10,
  },
  reportsStatCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    width: '45%',
    alignItems: 'flex-start',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportsStatTitle: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  reportsStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'left',
    marginBottom: 2,
  },
  lowStockContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    marginTop: 10,
  },
  reportsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
    color: Colors.primary,
  },
  lowStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGray,
    gap: 12,
  },
  lowStockImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: Colors.extraLightGray,
  },
  reportsProductName: {
    fontSize: 14,
    textAlign: 'left',
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  lowStockWarning: {
    color: Colors.red,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  lowStockStock: {
    color: Colors.gray,
    textAlign: 'left',
  },
});

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
  paymentConfirmed: boolean;
  createdAt: Date;
  userId?: string; // Added for notification
}

interface Product {
  id: string;
  name: string;
  stock: number;
  images?: string[];
  title?: string;
  productName?: string;
}

interface ReportsOrderItem {
  quantity: number;
}

interface ReportsOrder {
  totalAmount?: number;
  total?: number;
  items: ReportsOrderItem[];
  createdAt: Timestamp;
  status: string;
  paymentConfirmed: boolean;
}

interface TopProduct {
  productId: string;
  qty: number;
}

interface DailySale {
  date: string;
  total: number;
}

interface KPIState {
  conversionRate: number;
  abandonmentRate: number;
  topProducts: TopProduct[];
  dailySales: DailySale[];
}

const AdminPanel = () => {
  const { tab } = useLocalSearchParams();
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
  const [products, setProducts] = useState<Product[]>([]);
  const [timeFilter, setTimeFilter] = useState<'today' | 'month' | 'year'>('today');
  const [revenue, setRevenue] = useState<number>(0);
  const [soldProducts, setSoldProducts] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [kpi, setKPI] = useState<KPIState>({
    conversionRate: 0,
    abandonmentRate: 0,
    topProducts: [],
    dailySales: []
  });
  const [kpiLoading, setKPILoading] = useState(true);

  const db = getFirestore();
  const auth = getAuth();

  const fetchKPIs = async () => {
    setKPILoading(true);
    try {
      // جلب المستخدمين
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => doc.id);

      // جلب الطلبات
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders: any[] = ordersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      // جلب السلات
      const cartsSnap = await getDocs(collection(db, 'carts'));
      const carts: any[] = cartsSnap.docs.map(doc => doc.data());

      // حساب Conversion Rate
      const usersWithOrders = new Set(orders.map(o => o.userId));
      const conversionRate = users.length > 0 ? (usersWithOrders.size / users.length) * 100 : 0;

      // حساب Abandonment Rate
      const usersWithCarts = new Set(carts.map(c => c.userId));
      let abandoned = 0;
      usersWithCarts.forEach(uid => {
        if (!usersWithOrders.has(uid)) abandoned++;
      });
      const abandonmentRate = usersWithCarts.size > 0 ? (abandoned / usersWithCarts.size) * 100 : 0;

      // المنتجات الأكثر مبيعًا
      const productSales: { [key: string]: number } = {};
      orders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (!item.productId) return;
            if (!productSales[item.productId]) productSales[item.productId] = 0;
            productSales[item.productId] += Number(item.quantity) || 1;
          });
        }
      });
      const topProducts = Object.entries(productSales)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(([productId, qty]) => ({ productId, qty: qty as number }));

      // مبيعات يومية
      const salesByDay: { [key: string]: number } = {};
      orders.forEach(order => {
        if (!order.createdAt || !order.total) return;
        let dateStr = '';
        if (order.createdAt.toDate) {
          dateStr = order.createdAt.toDate().toISOString().slice(0, 10);
        } else if (typeof order.createdAt === 'string') {
          dateStr = order.createdAt.slice(0, 10);
        } else if (order.createdAt instanceof Date) {
          dateStr = order.createdAt.toISOString().slice(0, 10);
        }
        if (!salesByDay[dateStr]) salesByDay[dateStr] = 0;
        salesByDay[dateStr] += Number(order.total);
      });
      const dailySales = Object.entries(salesByDay).map(([date, total]) => ({ date, total: total as number }));

      setKPI({
        conversionRate,
        abandonmentRate,
        topProducts,
        dailySales,
      });
    } catch (e) {
      console.error('Error fetching KPIs:', e);
    } finally {
      setKPILoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const totalProducts = productsSnapshot.size;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', today)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const dailyOrders = ordersSnapshot.size;

      const allOrdersQuery = query(collection(db, 'orders'));
      const allOrdersSnapshot = await getDocs(allOrdersQuery);
      
      let totalRevenue = 0;
      allOrdersSnapshot.forEach(doc => {
        const order = doc.data();
        if (order.status === 'completed' && order.paymentConfirmed) {
          totalRevenue += order.total || 0;
        }
      });

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

  const fetchReportsData = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      let startDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const q = query(ordersRef, where('createdAt', '>=', Timestamp.fromDate(startDate)));
      const querySnapshot = await getDocs(q);
      
      let totalRevenue = 0;
      let totalSoldProducts = 0;
      
      querySnapshot.forEach((doc) => {
        const order = doc.data() as ReportsOrder;
        if (order.status === 'completed' && order.paymentConfirmed) {
          totalRevenue += order.total ?? order.totalAmount ?? 0;
          totalSoldProducts += Array.isArray(order.items)
            ? order.items.reduce((sum: number, item: ReportsOrderItem) => sum + (item.quantity || 0), 0)
            : 0;
        }
      });

      setRevenue(totalRevenue);
      setSoldProducts(totalSoldProducts);

      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const lowStock: Product[] = [];
      
      productsSnapshot.forEach((doc) => {
        const product = doc.data() as Product;
        if (product.stock <= 3) {
          lowStock.push({
            id: doc.id,
            name: product.name || product.title || product.productName || 'Unnamed Product',
            stock: product.stock,
            images: product.images,
            title: product.title,
            productName: product.productName
          });
        }
      });

      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const admin = await checkIfAdmin();
      setIsAdmin(admin);
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const ordersQuery = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc')
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersData = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            const order: Order = {
              id: doc.id,
              customerName: data.customerName || 'غير معروف',
              customerPhone: data.customerPhone || 'غير معروف',
              customerAddress: data.customerAddress || 'غير معروف',
              customerCity: data.customerCity || 'غير معروف',
              userId: data.userId, // Ensure userId is captured
              items: Array.isArray(data.items) ? data.items.map((item: any) => ({
                name: typeof item.name === 'string' ? item.name : '',
                price: typeof item.price === 'number' ? item.price : 0,
                quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                images: Array.isArray(item.images) ? item.images : []
              })) : [],
              total: typeof data.total === 'number' ? data.total : 0,
              status: typeof data.status === 'string' ? data.status : 'pending',
              paymentConfirmed: typeof data.paymentConfirmed === 'boolean' ? data.paymentConfirmed : false,
              createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
                ? data.createdAt.toDate()
                : new Date(data.createdAt || Date.now())
            };
            return order;
          });
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching orders:', error);
          Alert.alert('Error', 'Failed to fetch orders');
        }
      };
      fetchOrders();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin && activeTab === 'products') {
      const fetchProducts = async () => {
        try {
          const productsSnapshot = await getDocs(collection(db, 'products'));
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.data().title || doc.data().productName || 'Unnamed Product',
            stock: typeof doc.data().stock === 'number' ? doc.data().stock : 0,
            images: Array.isArray(doc.data().images) ? doc.data().images : [],
            title: doc.data().title,
            productName: doc.data().productName
          } as Product));
          setProducts(productsData);
        } catch (error) {
          console.error('Error fetching products:', error);
          Alert.alert('Error', 'Failed to fetch products');
        }
      };
      fetchProducts();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin && activeTab === 'reports') {
      fetchReportsData();
    }
  }, [isAdmin, activeTab, timeFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'kpi') {
      fetchKPIs();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (tab === 'orders') {
      setActiveTab('orders');
    }
  }, [tab]);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        confirmedAt: Timestamp.fromDate(new Date())
      });
      
      // Find the order to get userId
      const order = orders.find(o => o.id === orderId);
      if (order && order.userId) {
        await sendOrderConfirmationNotification(order.userId, orderId);
        console.log('User notified of order confirmation:', order.userId);
      } else {
        console.warn('Order or userId not found for notification:', orderId);
      }

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

  const handleConfirmPayment = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        paymentConfirmed: true
      });
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, paymentConfirmed: true }
          : order
      ));

      fetchStats();
      Alert.alert('Success', 'Payment has been confirmed successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      Alert.alert('Error', 'Failed to confirm payment');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      Alert.alert(
        'Delete Product',
        'Are you sure you want to delete this product?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteProduct(productId);
              setProducts(products.filter(product => product.id !== productId));
              Alert.alert('Success', 'Product deleted successfully');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const renderProductsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products Management</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/AddProduct')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={() => router.push('/ProductsManagement')}
        >
          <Ionicons name="list-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Manage Products</Text>
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
                <View key={index} style={styles.productCard}>
                  <Image 
                    source={{ uri: item.images[0] }} 
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>₪{item.price}</Text>
                    <Text style={styles.productDescription}>Quantity: {item.quantity}</Text>
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
                {order.paymentConfirmed && (
                  <Text style={[styles.statusText, { color: 'green' }]}>
                    Payment Confirmed
                  </Text>
                )}
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
              {!order.paymentConfirmed && (
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: 'green' }]}
                  onPress={() => handleConfirmPayment(order.id)}
                >
                  <Ionicons name="cash-outline" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
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

  const renderKPIsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>KPIs</Text>
      </View>
      {kpiLoading ? (
        <Text>Loading KPIs...</Text>
      ) : (
        <>
          {/* KPIs Cards */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.statNumber}>{kpi.conversionRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
            <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.statNumber}>{kpi.abandonmentRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Abandonment Rate</Text>
            </View>
          </View>

          {/* Top Products */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Products</Text>
          </View>
          {kpi.topProducts.length === 0 || products.length === 0 ? (
            <Text style={styles.statLabel}>No sales data yet.</Text>
          ) : (
            kpi.topProducts.map((prod, idx) => {
              const product = products.find(p => p.id === prod.productId);
              return (
                <View key={prod.productId} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Image
                    source={{ uri: product?.images?.[0] || 'https://via.placeholder.com/48x48?text=No+Image' }}
                    style={{ width: 40, height: 40, borderRadius: 8, marginRight: 10 }}
                  />
                  <View>
                    <Text style={styles.statLabel}>
                      {idx + 1}. {product?.name || product?.title || product?.productName || prod.productId}
                    </Text>
                    <Text style={styles.statLabel}>
                      Sold: {prod.qty}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Daily Sales */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Sales</Text>
          </View>
          {kpi.dailySales.length === 0 ? (
            <Text style={styles.statLabel}>No sales data yet.</Text>
          ) : (
            kpi.dailySales
              .sort((a, b) => b.date.localeCompare(a.date)) // الأحدث أولاً
              .map((sale, idx) => (
                <Text key={sale.date} style={styles.statLabel}>
                  {sale.date}: ₪{sale.total}
                </Text>
              ))
          )}
        </>
      )}
    </View>
  );

  const renderReportsSection = () => (
    <View style={styles.reportsContainer}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'today' && styles.activeFilter]}
          onPress={() => setTimeFilter('today')}
        >
          <Text style={styles.filterText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'month' && styles.activeFilter]}
          onPress={() => setTimeFilter('month')}
        >
          <Text style={styles.filterText}>This Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'year' && styles.activeFilter]}
          onPress={() => setTimeFilter('year')}
        >
          <Text style={styles.filterText}>This Year</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportsStatsContainer}>
        <View style={styles.reportsStatCard}>
          <Text style={styles.reportsStatTitle}>Revenue</Text>
          <Text style={styles.reportsStatValue}>{formatCurrency(revenue)}</Text>
        </View>

        <View style={styles.reportsStatCard}>
          <Text style={styles.reportsStatTitle}>Products Sold</Text>
          <Text style={styles.reportsStatValue}>{soldProducts}</Text>
        </View>
      </View>

      <View style={styles.lowStockContainer}>
        <Text style={styles.reportsSectionTitle}>Low Stock Products</Text>
        {lowStockProducts.length === 0 ? (
          <Text style={styles.noProductsText}>No low stock products found</Text>
        ) : (
          lowStockProducts.map((product, index) => {
            const imageUrl = product.images && product.images.length > 0 
              ? product.images[0] 
              : 'https://via.placeholder.com/48x48?text=No+Image';
            const productName = product.name || product.title || product.productName || 'Unnamed Product';
            return (
              <View key={index} style={styles.lowStockItem}>
                <Image source={{ uri: imageUrl }} style={styles.lowStockImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportsProductName}>{productName}</Text>
                  {product.stock <= 3 && (
                    <Text style={styles.lowStockWarning}>Reorder Needed!</Text>
                  )}
                  <Text style={styles.lowStockStock}>Stock: {product.stock}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );

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
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'kpi' && styles.activeTab]}
            onPress={() => setActiveTab('kpi')}
          >
            <Ionicons name="analytics-outline" size={24} color={activeTab === 'kpi' ? '#fff' : Colors.primary} />
            <Text style={[styles.tabText, activeTab === 'kpi' && styles.activeTabText]}>KPIs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
            onPress={() => setActiveTab('reports')}
          >
            <Ionicons name="bar-chart" size={24} color={activeTab === 'reports' ? '#fff' : Colors.primary} />
            <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'products' && renderProductsSection()}
          {activeTab === 'orders' && renderOrdersSection()}
          {activeTab === 'stats' && renderStatsSection()}
          {activeTab === 'kpi' && renderKPIsSection()}
          {activeTab === 'reports' && renderReportsSection()}
        </ScrollView>
      </View>
    </>
  );
};

export default AdminPanel;