import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ProductType } from '@/types/type';
import ImageSlider from '@/components/ImageSlider';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from '@/constants/Colors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {};
const ProductDetails = (props: Props) => {
    const { id, productType } = useLocalSearchParams();
    const [product, setProduct] = useState<ProductType | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getProductDetails();
        checkIfFavorite();
    }, []);

    const getProductDetails = async () => {
        const URL = productType === "sale"
            ?`http://192.168.112.177:8000/saleProducts/${id}`
             :`http://192.168.112.177:8000/products/${id}`;
        try {
            const response = await axios.get(URL);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            if (storedFavorites) {
                const favoritesArray: ProductType[] = JSON.parse(storedFavorites);
                const isFav = favoritesArray.some(item => item.id === Number(id));
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
                favoritesArray = favoritesArray.filter(item => item.id !== Number(id));
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
            const URL = 'http://192.168.112.177:8000/cart';
            await axios.post(URL, { ...product, quantity: 1 });
            setAddedToCart(true);
            router.push('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const headerHeight = useHeaderHeight();

    return (
        <>
            <Stack.Screen options={{
                title: "Product Details",
                headerTransparent: true,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.black} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity>
                        <Ionicons name="cart-outline" size={24} color={Colors.black} />
                    </TouchableOpacity>
                ),
            }} />
            <ScrollView style={{ marginTop: headerHeight, marginBottom: 60 }}>
                <View>
                    {product && product.images &&
                        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                            <ImageSlider imageList={product.images} />
                        </Animated.View>}
                    {product && (
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

                            <Animated.Text style={styles.productTitle} entering={FadeInDown.delay(700).duration(500)}>{product.title}</Animated.Text>

                            <Animated.View style={styles.priceWrapper} entering={FadeInDown.delay(900).duration(500)}>
                                <Text style={styles.productPrice}>₪ {product.price.toFixed(2)}</Text>
                                <Text style={styles.oldPrice}>₪ {(product.price * 1.2).toFixed(2)}</Text>

                                <View style={styles.discountBox}>
                                    <Text style={styles.discountText}>-6%</Text>
                                </View>
                            </Animated.View>

                            <Animated.Text style={styles.description}
                                entering={FadeInDown.delay(1100).duration(500)}>{product.description}</Animated.Text>

                            <TouchableOpacity
                                style={[styles.cartButton, addedToCart && styles.cartButtonAdded]}
                                onPress={addToCart}
                                disabled={addedToCart}
                            >
                                <Animated.Text
                                    style={styles.cartButtonText}
                                    entering={FadeInDown.delay(1100).duration(500)}
                                >
                                    {addedToCart ? 'Added to Cart' : 'ADD TO CART'}
                                </Animated.Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        paddingHorizontal: 20,
    },
    ratingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: "bold",
    },
    productTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 10,
    },
    productPrice: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#E65100",
    },
    oldPrice: {
        fontSize: 16,
        fontWeight: '400',
        textDecorationLine: 'line-through',
        color: Colors.gray,
    },
    discountBox: {
        backgroundColor: "white",
        borderColor: "#E65100",
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 1,
        paddingHorizontal: 1,
    },
    discountText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#E65100",
    },
    description: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '400',
        color: Colors.black,
        letterSpacing: 0.6,
        lineHeight: 20,
    },
    productVariationWrapper: {
        flexDirection: 'row',
        marginTop: 20,
        flexWrap: 'wrap',
    },
    productVariationType: {
        width: '50%',
        gap: 5,
        marginBottom: 10,
    },
    productVariationTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.black,
    },
    cartButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    cartButtonAdded: {
        backgroundColor: 'gray',
    },
    cartButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    productVariationValueWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexWrap: 'wrap',
    },
    productVariationColorValue: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    productVariationSizeValue: {
        width: 50,
        height: 30,
        borderRadius: 5,
        backgroundColor: Colors.extraLightGray,
        justifyContent: "center",
        alignItems: "center",
        borderColor: Colors.lightGray,
        borderWidth: 1,
    },
    productVariationSizeValueText: {
        fontSize: 12,
        fontWeight: "500",
        color: Colors.black,
    },
});