import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ProductType, CartItemType } from '@/types/type';
import ImageSlider from '@/components/ImageSlider';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from '@/constants/Colors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { doc, getDoc, collection, addDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

const ProductDetails = () => {
    const { id, productType } = useLocalSearchParams();
    const [product, setProduct] = useState<ProductType | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const headerHeight = useHeaderHeight();

    useEffect(() => {
        if (id && productType) {
                getProductDetails();
            checkIfFavorite();
        }
    }, [id, productType]);

    const getProductDetails = async () => {
        try {
            setLoading(true);
            console.log('Fetching product details for:', { id, productType });
            
            if (!id) {
                Alert.alert('Error', 'Product ID is missing');
                setProduct(null);
                return;
            }

            const collectionName = productType === "sale" ? "saleProducts" : "products";
            const docRef = doc(db, collectionName, id as string);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('Raw product data:', data);
                
                // Set fixed discount percentage of 15% for sale products
                const discountPercent = productType === "sale" ? 15 : 0;
                
                // Calculate discounted price
                const originalPrice = Number(data.originalPrice) || Number(data.price) || 0;
                const discountedPrice = productType === "sale" 
                    ? originalPrice - (originalPrice * (discountPercent / 100))
                    : originalPrice;
                
                // Ensure all required fields exist with default values and are strings
                const productData: ProductType = {
                    id: docSnap.id,
                    title: String(data.title || 'No title available'),
                    price: discountedPrice, // Use discounted price for sale products
                    description: String(data.description || 'No description available'),
                    images: Array.isArray(data.images) ? data.images.map(String) : [],
                    category: String(data.category || 'Uncategorized'),
                    discount: discountPercent,
                    originalPrice: originalPrice,
                    productType: undefined
                };
                
                console.log('Processed product data:', productData);
                setProduct(productData);
                
                // Check if product is in favorites
                checkIfFavorite();
            } else {
                console.log("No such document!");
                Alert.alert('Error', 'Product not found');
                setProduct(null);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            Alert.alert(
                'Error',
                'Failed to load product details. Please try again.',
                [
                    {
                        text: 'Try Again',
                        onPress: () => getProductDetails()
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            if (storedFavorites) {
                const favoritesArray: ProductType[] = JSON.parse(storedFavorites);
                const isFav = favoritesArray.some(item => item.id === product?.id);
                setIsFavorite(isFav);
            }
        } catch (error) {
            console.error("Error checking favorite status:", error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            let favoritesArray: ProductType[] = storedFavorites ? JSON.parse(storedFavorites) : [];

            if (isFavorite) {
                favoritesArray = favoritesArray.filter(item => item.id !== product?.id);
            } else {
                if (product) {
                    favoritesArray.push(product);
                }
            }

            await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const addToCart = async () => {
        if (!product) return;

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                console.log('User not logged in');
                router.push('/signin');
                return;
            }

            console.log('Adding product to cart:', product);
            const cartRef = collection(db, 'carts');
            const q = query(cartRef, 
                where('userId', '==', user.uid), 
                where('productId', '==', product.id)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Add new item to cart
                const cartItem = {
                    userId: user.uid,
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.images[0],
                    quantity: 1,
                    createdAt: new Date(),
                    productType: productType
                };
                
                console.log('Adding new cart item:', cartItem);
                const docRef = await addDoc(cartRef, cartItem);
                console.log('New cart item added with ID:', docRef.id);
            } else {
                // Update existing item quantity
                const docRef = doc(db, 'carts', querySnapshot.docs[0].id);
                const currentQuantity = querySnapshot.docs[0].data().quantity;
                console.log('Updating existing cart item quantity:', currentQuantity + 1);
                await updateDoc(docRef, {
                    quantity: currentQuantity + 1,
                    updatedAt: new Date()
                });
            }

            Alert.alert('Success', 'Product added to cart successfully');
            router.push('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add product to cart. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={getProductDetails}
                >
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen 
                options={{ 
                    headerShown: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <TouchableOpacity 
                            style={{ marginLeft: 10 }}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity 
                            style={{ marginRight: 10 }}
                            onPress={() => router.push('/cart')}
                        >
                            <Ionicons name="cart-outline" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: Colors.white,
                    },
                }} 
            />
            <View style={[styles.container, { marginTop: 0 }]}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : product && product.id ? (
                    <ScrollView style={styles.contentContainer}>
                        {product.images && product.images.length > 0 && (
                            <ImageSlider imageList={product.images} />
                        )}
                        
                        <View style={styles.detailsContainer}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.productTitle}>{String(product.title || 'No title')}</Text>
                                <TouchableOpacity onPress={toggleFavorite}>
                                    <Ionicons
                                        name={isFavorite ? "heart" : "heart-outline"}
                                        size={24}
                                        color={isFavorite ? "red" : Colors.black}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.priceContainer}>
                                {productType === "sale" ? (
                                    <>
                                        <Text style={styles.currentPrice}>
                                            ₪{((product.originalPrice || 0) - ((product.originalPrice || 0) * (product.discount || 0) / 100)).toFixed(2)}
                                        </Text>
                                        <Text style={styles.originalPrice}>
                                            ₪{(product.originalPrice || 0).toFixed(2)}
                                        </Text>
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>-{product.discount}%</Text>
                                        </View>
                                    </>
                                ) : (
                                    <Text style={styles.currentPrice}>
                                        ₪{(product.price || 0).toFixed(2)}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.discountContainer}>
                                <Text style={styles.discountTitle}>Discount</Text>
                                <Text style={styles.discountValue}>
                                    {productType === "sale" ? `${product.discount}%` : '0%'}
                                </Text>
                            </View>

                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionTitle}>Description</Text>
                                <Text style={styles.descriptionText}>{String(product.description || 'No description available')}</Text>
                            </View>

                            <View style={styles.categoryContainer}>
                                <Text style={styles.categoryTitle}>Category</Text>
                                <Text style={styles.categoryText}>{String(product.category || 'Uncategorized')}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addToCartButton}
                                onPress={addToCart}
                            >
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Product not found</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={getProductDetails}
                        >
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: Colors.black,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
    detailsContainer: {
        padding: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
        flex: 1,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    currentPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    originalPrice: {
        fontSize: 16,
        color: Colors.gray,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    discountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
    },
    discountTitle: {
        fontSize: 16,
        color: Colors.black,
        fontWeight: 'bold',
    },
    discountValue: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        color: Colors.gray,
        lineHeight: 24,
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 10,
    },
    categoryText: {
        fontSize: 16,
        color: Colors.gray,
    },
    addToCartButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    addToCartText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProductDetails;