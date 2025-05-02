import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import React from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const GiftScreen = () => {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Gift',
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => router.push('/ready-made-gifts')}
              activeOpacity={0.8}
            >
              <Image 
                source={require('@/assets/images/pak.jpg')}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <View style={styles.categoryContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.categoryTitle}>Ready-Made Gift Packages</Text>
                  <Text style={styles.categoryDescription}>Choose from a variety of ready-made gift packages</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => router.push('/custom-gifts')}
              activeOpacity={0.8}
            >
              <Image 
                source={require('@/assets/images/cus.jpg')}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <View style={styles.categoryContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.categoryTitle}>Customized Gifts</Text>
                  <Text style={styles.categoryDescription}>Select your favorite items and create your own special gift</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  buttonsContainer: {
    flex: 1,
    padding: 16,
  },
  categoryButton: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 200,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'left',
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'left',
    lineHeight: 20,
  },
  headerButton: {
    marginHorizontal: 10,
    padding: 5,
  },
});

export default GiftScreen;