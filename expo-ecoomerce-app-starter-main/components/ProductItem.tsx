import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import { ProductType } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link } from "expo-router";

type Props = {
    item: ProductType;
    index: number;
};

const width = Dimensions.get('window').width - 40;

const ProductItem = ({ item, index }: Props) => {
    return (
        <Link 
            href={{ pathname:"/product-details/[id]", params: { id: item.id.toString() } }} 
            asChild
        >
            <TouchableOpacity>
                <Animated.View 
                    style={styles.Container} 
                    entering={FadeInDown.delay(300 + index * 100).duration(500)}
                >
                    <Image
                        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }} 
                        style={styles.productImg} 
                    />
                    <TouchableOpacity style={styles.bookmarkBtn}>
                        <Ionicons name='heart-outline' size={22} color={Colors.primary} />
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