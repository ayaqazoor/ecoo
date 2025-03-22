import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ProductType } from '@/types/type';
import ImageSlider from '@/components/ImageSlider';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from '@/constants/Colors';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProductDetails = () => {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<ProductType | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        getProductDetails();
        checkIfFavorite();
    }, []);

    // جلب تفاصيل المنتج
    const getProductDetails = async () => {
        const URL = `http://192.168.129.177:8000/saleProducts/${id}`;
        try {
            const response = await axios.get(URL);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    // التحقق مما إذا كان المنتج مضافًا إلى المفضلة
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

    // إضافة أو إزالة المنتج من المفضلة
    const toggleFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            let favoritesArray: ProductType[] = storedFavorites ? JSON.parse(storedFavorites) : [];

            if (isFavorite) {
                // إزالة المنتج من المفضلة
                favoritesArray = favoritesArray.filter(item => item.id !== Number(id));
            } else {
                // إضافة المنتج إلى المفضلة
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

    return (
        <View>
            {product && product.images && <ImageSlider imageList={product.images} />}
            {product && (
                <View style={styles.container}>
                    <View style={styles.ratingWrapper}>
                        <View style={styles.ratingSection}>
                            <Ionicons name="star" size={20} color={"#D4AF37"} />
                            <Text style={styles.rating}>4.7</Text>
                        </View>

                        {/* زر المفضلة */}
                        <TouchableOpacity onPress={toggleFavorite}>
                            <Ionicons 
                                name={isFavorite ? "heart" : "heart-outline"} 
                                size={24} 
                                color={isFavorite ? "red" : Colors.black} 
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.productPrice}>{product.price} $</Text>
                </View>
            )}
        </View>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({
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
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "green",
    },
});
