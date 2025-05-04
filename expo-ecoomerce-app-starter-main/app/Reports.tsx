import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Colors } from '../constants/Colors';

interface Product {
  name: string;
  stock: number;
  images?: string[];
}

interface OrderItem {
  quantity: number;
}

interface Order {
  totalAmount: number;
  items: OrderItem[];
  createdAt: Timestamp;
}

const Reports = () => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'month' | 'year'>('today');
  const [revenue, setRevenue] = useState<number>(0);
  const [soldProducts, setSoldProducts] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [timeFilter]);

  const fetchReportData = async () => {
    try {
      // حساب الإيرادات والمنتجات المباعة
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
        const order = doc.data() as any;
        if (order.status === 'completed' && order.paymentConfirmed) {
          totalRevenue += order.total ?? order.totalAmount ?? 0;
          totalSoldProducts += Array.isArray(order.items)
            ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
            : 0;
        }
      });

      setRevenue(totalRevenue);
      setSoldProducts(totalSoldProducts);

      // التحقق من المنتجات ذات المخزون المنخفض
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const lowStock: Product[] = [];
      
      productsSnapshot.forEach((doc) => {
        const product = doc.data() as Product;
        if (product.stock <= 3) {
          lowStock.push(product);
        }
      });

      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

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

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Revenue</Text>
          <Text style={styles.statValue}>{formatCurrency(revenue)}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Products Sold</Text>
          <Text style={styles.statValue}>{soldProducts}</Text>
        </View>
      </View>

      <View style={styles.lowStockContainer}>
        <Text style={styles.sectionTitle}>Low Stock Products</Text>
        {lowStockProducts.map((product, index) => {
          const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/48x48?text=No+Image';
          const p = product as any;
          const productName = p.name || p.title || p.productName || 'Unnamed Product';
          return (
            <View key={index} style={styles.lowStockItem}>
              <Image source={{ uri: imageUrl }} style={styles.lowStockImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{productName}</Text>
                {product.stock <= 3 && (
                  <Text style={styles.lowStockWarning}>Reorder Needed!</Text>
                )}
                <Text style={styles.lowStockStock}>Stock: {product.stock}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    direction: 'ltr',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGray,
    alignItems: 'flex-start',
  },
  title: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 20,
    gap: 10,
  },
  statCard: {
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
  statTitle: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  statValue: {
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
  sectionTitle: {
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
  productName: {
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

export default Reports;