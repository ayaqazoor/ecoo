import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

interface Statistics {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus: {
    pending: number;
    completed: number;
    cancelled: number;
  };
}

const Statistics = () => {
  const [statistics, setStatistics] = useState<Statistics>({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    ordersByStatus: {
      pending: 0,
      completed: 0,
      cancelled: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch orders
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      
      // Calculate order statistics
      const totalOrders = orders.length;
      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const ordersByStatus = {
        pending: orders.filter(order => order.status === 'pending').length,
        completed: orders.filter(order => order.status === 'completed').length,
        cancelled: orders.filter(order => order.status === 'cancelled').length
      };

      // Fetch products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const totalProducts = productsSnapshot.size;

      // Fetch users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      setStatistics({
        totalOrders,
        totalSales,
        totalProducts,
        totalUsers,
        ordersByStatus
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإحصائيات العامة</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalOrders}</Text>
            <Text style={styles.statLabel}>إجمالي الطلبات</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₪{statistics.totalSales.toFixed(2)}</Text>
            <Text style={styles.statLabel}>إجمالي المبيعات</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalProducts}</Text>
            <Text style={styles.statLabel}>المنتجات</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.totalUsers}</Text>
            <Text style={styles.statLabel}>المستخدمين</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>حالة الطلبات</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.ordersByStatus.pending}</Text>
            <Text style={styles.statLabel}>طلبات معلقة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.ordersByStatus.completed}</Text>
            <Text style={styles.statLabel}>طلبات مكتملة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statistics.ordersByStatus.cancelled}</Text>
            <Text style={styles.statLabel}>طلبات ملغية</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});

export default Statistics; 