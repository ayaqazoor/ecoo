import { StyleSheet, Text, View, } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ProductType } from '@/types/type';
import ImageSlider from '@/components/ImageSlider';
import {Ionicons} from "@expo/vector-icons";
import { Colors } from '@/constants/Colors';
type Props = {};

const ProductDetails = (props: Props) => {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<ProductType | null>(null); // ✅ استخدام null كقيمة ابتدائية

    useEffect(() => {
        getProductDetails();
    }, []);

    const getProductDetails = async () => {
        const URL = `http://192.168.212.177:8000/saleProducts/${id}`; // ✅ استخدام Backticks
        try {
            const response = await axios.get(URL);
            console.log('Product Details:', response.data);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    return (
        <View>
            {product && product.images && <ImageSlider imageList={product.images} />} 
            {product && (
                <View style={styles.container}>
                    <View style={styles.ratingWrapper}>
                        <View>
                        <Ionicons name="star" size={20} color={"#D4AF37"} />
<Text style={styles.rating}>4.7</Text>
</View>
<Ionicons name="heart-outline" size={22} color={Colors.black}/>
     </View>

 </View>
            )}
        </View>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({
container:{
  paddingHorizontal:20,  
},
ratingWrapper:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:5,
},
rating:{

},



});