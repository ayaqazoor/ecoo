import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { db, auth } from '@/config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { router, Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const headerHeight = useHeaderHeight();

  const getCategoryId = (categoryName: string): number => {
    const categoryMap: { [key: string]: number } = {
      makeup: 5,
      'hand bags': 4,
      'skin care': 2,
      accessories: 3,
      perfumes: 7,
      'body care': 1,
      'hair care': 6,
      watches: 8,
      gift: 9,
    };
    return categoryMap[categoryName.toLowerCase()] || 0;
  };

  const handleAddProduct = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be signed in to add a product');
      return;
    }

    if (!name || !title || !price || !description || !category || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const productId = `PROD-${Date.now()}`;
      const categoryId = getCategoryId(category);

      const productData = {
        id: productId,
        name,
        title,
        price: parseFloat(price),
        description,
        category: {
          id: categoryId,
          name: category,
          image: imageUrl ? [imageUrl] : ['https://via.placeholder.com/150'],
        },
        images: imageUrl ? [imageUrl] : ['https://via.placeholder.com/150'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        stock: parseInt(stock),
        rating: 0,
        reviews: 0,
        sale: false,
        salePrice: null,
        brand: 'Default Brand',
        colors: [],
        sizes: [],
        tags: [],
        userId: auth.currentUser.uid, // For rules validation
      };

      await setDoc(doc(db, 'products', productId), productData);
      Alert.alert('Success', 'Product added successfully');

      setName('');
      setTitle('');
      setPrice('');
      setDescription('');
      setCategory('');
      setImageUrl('');
      setStock('');

      router.back();
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to add product: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Product</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.headerLine} />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter product name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter product title"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Enter price"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  value={stock}
                  onChangeText={setStock}
                  placeholder="Enter stock quantity"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Enter category (makeup, hand bags, skin care, etc.)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter product description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Image URL (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="Enter image URL"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleAddProduct}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Product</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerLine: {
    height: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProduct;