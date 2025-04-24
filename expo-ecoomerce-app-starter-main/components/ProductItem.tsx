import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ProductType } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    item: ProductType;
    index: number;
    productType:"sale" | "regular";
};

const width = Dimensions.get('window').width - 40;

const ProductItem = ({ item, index, productType}: Props) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        checkIfFavorite();
    }, []);

    const checkIfFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            if (storedFavorites) {
                const favorites = JSON.parse(storedFavorites);
                const isFav = favorites.some((fav: ProductType) => fav.id === item.id);
                setIsFavorite(isFav);
            }
        } catch (error) {
            console.error("Error checking favorites:", error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

            if (isFavorite) {
                favorites = favorites.filter((fav: ProductType) => fav.id !== item.id);
            } else {
                favorites.push(item);
            }

            await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error("Error updating favorites:", error);
        }
    };

    return (
        <Link 
            href={{
                pathname:'/product-details/[id]',
                params:{id:item.id, productType: productType},


            }} asChild>
        
            <TouchableOpacity>
                <Animated.View 
                    style={styles.Container} 
                    entering={FadeInDown.delay(300 + index * 100).duration(500)}
                >
                    <Image
                        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }} 
                        style={styles.productImg} 
                    />

                    {/* ✅ زر المفضلة */}
                    <TouchableOpacity style={styles.bookmarkBtn} onPress={toggleFavorite}>
                        <Ionicons 
                            name={isFavorite ? 'heart' : 'heart-outline'} 
                            size={22} 
                            color={isFavorite ? 'red' : Colors.primary} 
                        />
                    </TouchableOpacity>

                    <View style={styles.productInfo}>
                        <Text style={styles.price}>₪ {item.price}</Text>
                        <View style={styles.ratingWrapper}>
                            <Ionicons name='star' size={18} color={'#D4AF37'} />
                            <Text style={styles.rating}>4.7</Text>
                        </View>
                    </View>
                    <Text style={styles.Title}>{item.title}</Text>
                </Animated.View>
            </TouchableOpacity>
        </Link>
    );
};

export default ProductItem;

const styles = StyleSheet.create({
    productImg: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 10,
    },
    Title: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.black,
        letterSpacing: 1.1,
    },
    Container: {
        width: width / 2 - 10,
    },
    bookmarkBtn: {
        position: 'absolute',
        right: 20,
        top: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        padding: 5,
        borderRadius: 30,
    },
    productInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    ratingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 1,
    },
    rating: {
        fontSize: 14,
        color: Colors.gray,
    },
});