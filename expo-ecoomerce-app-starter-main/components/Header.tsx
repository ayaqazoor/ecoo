import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* شعار M&H */}
      <Image source={require('@/assets/images/mhh.png')} style={styles.logo} />
<Link href={'/explore'} asChild>
      {/* شريط البحث */}
      <TouchableOpacity style={styles.searchBar}>
        <Text style={styles.search}>Search</Text>
        <Ionicons name="search-outline" size={20} color={Colors.primary} style={styles.icon} />
      </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.lightbeige,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 15,
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  logo: {
    width: 90, // ضبط عرض الشعار
    height: 50, // ضبط ارتفاع الشعار
    resizeMode: 'contain', // التأكد من أن الصورة لا تُقتطع
  },
  searchBar: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 15,
  },
  search: {
    fontSize: 15,
    color: Colors.gray,
  },
  icon: {
    marginLeft: 10,
  },
});
