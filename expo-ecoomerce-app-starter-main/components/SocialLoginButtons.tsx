import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Href, Link } from 'expo-router';
import Google from '@/assets/images/google-logo.svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";

type Props = {
    emailHref: Href;
    onGooglePress?: () => void;
    googleTitle?: string; // جعل العنوان اختياريًا
};

const SocialLoginButtons = ({ emailHref, onGooglePress, googleTitle = "Log In With Google" }: Props) => {
    return (
        <View style={styles.socialloginWrapper}> 

           

            {/* زر تسجيل الدخول بـ Google */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
                <TouchableOpacity style={styles.googleButton} onPress={onGooglePress}>
                    <Google width={24} height={24} />
                    <Text style={styles.googleText}>{googleTitle}</Text>
                </TouchableOpacity>
            </Animated.View>

           

        </View>
    );
};

export default SocialLoginButtons;

const styles = StyleSheet.create({
    socialloginWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6E7DF',
        paddingVertical: 11, // زيادة الارتفاع
        paddingHorizontal: 70, // زيادة التباعد الجانبي
        borderRadius: 40, // جعل الحواف أكثر استدارة
        borderWidth: 0.5, // جعل الحد أوضح
        borderColor: Colors.primary,
        alignSelf: 'stretch',
        justifyContent: 'center', // ضمان أن المحتوى في المنتصف
    },
    googleText: {
        marginLeft: 12, // زيادة التباعد بين الأيقونة والنص
        fontSize: 16, // جعل الخط أكبر
        color: Colors.black,
        fontWeight: '600', // جعل الخط أكثر سماكة
    },
});
