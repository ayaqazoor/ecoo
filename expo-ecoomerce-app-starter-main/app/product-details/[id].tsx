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
            
            const collectionName = productType === "sale" ? "saleProducts" : "products";
            const docRef = doc(db, collectionName, id as string);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('Product data:', data);
                
                const productData: ProductType = {
                    id: docSnap.id,
                    title: data.title || '',
                    price: Number(data.price) || 0,
                    description: data.description || '',
                    images: Array.isArray(data.images) ? data.images : [],
                    category: data.category || '',
                    discount: data.discount || 0,
                    originalPrice: data.originalPrice || Number(data.price) || 0
                };
                
                console.log('Processed product data:', productData);
                setProduct(productData);
            } else {
                console.log("No such document!");
                setProduct(null);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
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
            <Stack.Screen options={{
                title: "Product Details",
                headerTransparent: true,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity onPress={() => router.push('/cart')}>
                        <Ionicons name="cart-outline" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                ),
            }} />
            <ScrollView style={{ marginTop: headerHeight, marginBottom: 60 }}>
                <View>
                    {product.images && product.images.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                            <ImageSlider imageList={product.images} />
                        </Animated.View>
                    )}
                    
                    <View style={styles.container}>
                        <Animated.View style={styles.ratingWrapper} entering={FadeInDown.delay(500).duration(500)}>
                            <View style={styles.ratingSection}>
                                <Ionicons name="star" size={20} color={"#D4AF37"} />
                                <Text style={styles.rating}>4.7</Text>
                            </View>
                            <TouchableOpacity onPress={toggleFavorite}>
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isFavorite ? "red" : Colors.black}
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.Text style={styles.productTitle} entering={FadeInDown.delay(700).duration(500)}>
                            {product.title}
                        </Animated.Text>

                        <Animated.View style={styles.priceWrapper} entering={FadeInDown.delay(900).duration(500)}>
                            <Text style={styles.productPrice}>₪ {product.price.toFixed(2)}</Text>
                            {product.discount && product.discount > 0 && product.originalPrice && (
                                <>
                                    <Text style={styles.oldPrice}>₪ {product.originalPrice.toFixed(2)}</Text>
                                    <View style={styles.discountBox}>
                                        <Text style={styles.discountText}>-{product.discount}%</Text>
                                    </View>
                                </>
                            )}
                        </Animated.View>

                        <Animated.Text style={styles.description} entering={FadeInDown.delay(1100).duration(500)}>
                            {product.description}
                        </Animated.Text>

                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={addToCart}
                        >
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
    ratingWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 5,
        fontSize: 16,
        color: Colors.gray,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.black,
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    productPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginRight: 10,
    },
    oldPrice: {
        fontSize: 18,
        color: Colors.gray,
        textDecorationLine: 'line-through',
        marginRight: 10,
    },
    discountBox: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        color: Colors.gray,
        lineHeight: 24,
        marginBottom: 20,
    },
    addToCartButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    addToCartText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProductDetails;