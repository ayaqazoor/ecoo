import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { router } from 'expo-router';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  categoryId: string;
  discount?: number;
  originalPrice?: number;
  productType?: string;
  stock?: number;
}

interface CategoryType {
  id: string;
  name: string;
  image: string;
}

// Define CATEGORY_MAPPINGS with all 9 categories
const CATEGORY_MAPPINGS: CategoryType[] = [
  { id: '2', name: 'Skin Care', image: '' },
  { id: '4', name: 'Hand Bags', image: '' },
  { id: '3', name: 'Accessories', image: '' },
  { id: '7', name: 'Perfumes', image: '' },
  { id: '1', name: 'Body Care', image: '' },
  { id: '5', name: 'Makeup', image: '' },
  { id: '6', name: 'Hair Care', image: '' },
  { id: '8', name: 'Watches', image: '' },
  { id: '9', name: 'Gift', image: '' },
];

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching all products from Firebase');

      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      const fetchedProducts: Product[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        console.log('📄 Raw Firebase document:', { id: docSnap.id, ...data });
        console.log('🔍 category.id type:', typeof data.category?.id, 'value:', data.category?.id);

        // استخراج categoryId من category.id
        const categoryId = data.category?.id ? String(data.category.id) : 'uncategorized';
        // استخراج اسم الفئة من category.name أو تعيين من CATEGORY_MAPPINGS
        const categoryName = data.category?.name || CATEGORY_MAPPINGS.find(c => c.id === categoryId)?.name || 'Uncategorized';

        return {
          id: docSnap.id,
          title: data.title || data.name || '',
          price: data.price || 0,
          description: data.description || '',
          images: data.images || [],
          category: categoryName,
          categoryId,
          discount: data.discount || 0,
          originalPrice: data.originalPrice || data.price || 0,
          productType: data.productType || 'unknown',
          stock: data.stock || 0,
        };
      });

      console.log('✅ Products fetched:', fetchedProducts.length);
      console.log('📊 Product category IDs:', fetchedProducts.map(p => ({ id: p.id, categoryId: p.categoryId })));
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      const selectedCategoryId = CATEGORY_MAPPINGS.find(c => c.name === selectedCategory)?.id;
      if (!selectedCategoryId) {
        console.warn('⚠️ No matching category ID found for:', selectedCategory);
        setFilteredProducts([]);
        return;
      }
      console.log('🔎 Filtering products by categoryId:', selectedCategoryId);
      filtered = products.filter(p => p.categoryId === selectedCategoryId);
      console.log('✅ Category filtered products:', filtered.length);
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
      console.log('🔎 Search query:', q, 'Filtered products:', filtered.length);
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'products', productId));
            setProducts(products.filter(p => p.id !== productId));
            setFilteredProducts(filteredProducts.filter(p => p.id !== productId));
            Alert.alert('Success', 'Product deleted successfully');
          } catch (err) {
            console.error('Error deleting product:', err);
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditPrice(product.price?.toString() || '');
    setEditStock(product.stock?.toString() || '');
    setEditDiscount(product.discount?.toString() || '');
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    if (!editPrice || !editStock) {
      Alert.alert('Error', 'Please fill in price and stock');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'products', selectedProduct.id), {
        price: parseFloat(editPrice),
        stock: parseInt(editStock),
        discount: parseFloat(editDiscount) || 0,
      });
      setProducts(products.map(p =>
        p.id === selectedProduct.id
          ? { ...p, price: parseFloat(editPrice), stock: parseInt(editStock), discount: parseFloat(editDiscount) || 0 }
          : p
      ));
      setFilteredProducts(filteredProducts.map(p =>
        p.id === selectedProduct.id
          ? { ...p, price: parseFloat(editPrice), stock: parseInt(editStock), discount: parseFloat(editDiscount) || 0 }
          : p
      ));
      setIsModalVisible(false);
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Products Management</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          <TouchableOpacity
            key="all"
            style={[styles.categoryButton, selectedCategory === 'all' && styles.selectedCategory]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[styles.categoryText, selectedCategory === 'all' && styles.selectedCategoryText]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORY_MAPPINGS.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedCategory === category.name && styles.selectedCategory]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text
                style={[styles.categoryText, selectedCategory === category.name && styles.selectedCategoryText]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>
            No products found. Check if products have correct category IDs.
          </Text>
          <Text style={styles.debugText}>
            Selected Category: {selectedCategory} (ID: {CATEGORY_MAPPINGS.find(c => c.name === selectedCategory)?.id || 'N/A'})
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.productsList}>
          {filteredProducts.map(product => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.images[0] }} style={styles.productImage} />
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.title}</Text>
                  <Text style={styles.productDescription}>Price: ₪{product.price}</Text>
                  <Text style={styles.productStock}>Stock: {product.stock}</Text>
                  <Text style={styles.productStock}>Discount: {product.discount || 0}%</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => handleEdit(product)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteProduct(product.id)}
                  style={[styles.deleteButton, { marginTop: 8 }]}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            {selectedProduct && (
              <>
                <Text style={styles.productName}>{selectedProduct.title}</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Price:</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    placeholder="Enter price"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Stock:</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editStock}
                    onChangeText={setEditStock}
                    placeholder="Enter stock"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Discount (%):</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editDiscount}
                    onChangeText={setEditDiscount}
                    placeholder="Enter discount"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    padding: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  productsList: {
    flex: 1,
    padding: 15,
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
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 5,
  },
  productDiscount: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    minWidth: 100,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
  },
  editInput: {
    width: 70,
    height: 35,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductsManagement;