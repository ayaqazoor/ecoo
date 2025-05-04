import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Order {
  id: string;
  total: number;
  date: Timestamp;
  items: any[];
}

const Reports = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<'all' | 'high' | 'low'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [dateFilter, selectedDate, revenueFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersCollection = collection(db, 'orders');
      const querySnapshot = await getDocs(ordersCollection);
      
      const ordersList: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersList.push({
          id: doc.id,
          total: data.total || 0,
          date: data.date,
          items: data.items || []
        });
      });

      setOrders(ordersList);
      setFilteredOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by date
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selectedDate);
    if (dateFilter === 'day') {
      endDate.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setMonth(0);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    }

    filtered = filtered.filter(order => {
      const orderDate = order.date.toDate();
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Filter by revenue
    if (revenueFilter === 'high') {
      filtered.sort((a, b) => b.total - a.total);
    } else if (revenueFilter === 'low') {
      filtered.sort((a, b) => a.total - b.total);
    }

    setFilteredOrders(filtered);
  };

  const calculateTotalRevenue = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, dateFilter === 'day' && styles.selectedFilter]}
              onPress={() => setDateFilter('day')}
            >
              <Text style={[styles.filterText, dateFilter === 'day' && styles.selectedFilterText]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateFilter === 'month' && styles.selectedFilter]}
              onPress={() => setDateFilter('month')}
            >
              <Text style={[styles.filterText, dateFilter === 'month' && styles.selectedFilterText]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateFilter === 'year' && styles.selectedFilter]}
              onPress={() => setDateFilter('year')}
            >
              <Text style={[styles.filterText, dateFilter === 'year' && styles.selectedFilterText]}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.revenueFilterContainer}>
          <Text style={styles.filterLabel}>Revenue Filter:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, revenueFilter === 'all' && styles.selectedFilter]}
              onPress={() => setRevenueFilter('all')}
            >
              <Text style={[styles.filterText, revenueFilter === 'all' && styles.selectedFilterText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, revenueFilter === 'high' && styles.selectedFilter]}
              onPress={() => setRevenueFilter('high')}
            >
              <Text style={[styles.filterText, revenueFilter === 'high' && styles.selectedFilterText]}>High</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, revenueFilter === 'low' && styles.selectedFilter]}
              onPress={() => setRevenueFilter('low')}
            >
              <Text style={[styles.filterText, revenueFilter === 'low' && styles.selectedFilterText]}>Low</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>Total Orders: {filteredOrders.length}</Text>
        <Text style={styles.summaryText}>Total Revenue: ₪{calculateTotalRevenue()}</Text>
      </View>

      <ScrollView style={styles.ordersList}>
        {filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <Text style={styles.orderDate}>
              {order.date.toDate().toLocaleDateString()}
            </Text>
            <Text style={styles.orderTotal}>₪{order.total}</Text>
            <Text style={styles.orderItems}>
              {order.items.length} items
            </Text>
          </View>
        ))}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  filters: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateFilterContainer: {
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.primary,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
  },
  revenueFilterContainer: {
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    margin: 15,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.primary,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  ordersList: {
    flex: 1,
    padding: 15,
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
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 5,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
});

export default Reports;