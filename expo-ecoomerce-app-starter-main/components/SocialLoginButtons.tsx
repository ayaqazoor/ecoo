import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Href, Link } from 'expo-router';
import Google from '@/assets/images/google-logo.svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";

type Props = {
    emailHref: Href;
};

const SocialLoginButtons = (props: Props) => {
    const {emailHref} = props;
    return (
        <View style={styles.socialloginWrapper}> 

            {/* Email Button */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Link href={emailHref} asChild>
                    <TouchableOpacity style={styles.button}>
                        <Ionicons name='mail-outline' size={24} color={Colors.black} />
                    </TouchableOpacity>
                </Link>
            </Animated.View>

            {/* Google Button */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
                <TouchableOpacity style={styles.button}>
                    <Google width={24} height={24} />
                </TouchableOpacity>
            </Animated.View>

            {/* Apple Button */}
            <Animated.View entering={FadeInDown.delay(1100).duration(500)}>
                <TouchableOpacity style={styles.button}>
                    <Ionicons name='logo-apple' size={24} color={Colors.black} />
                </TouchableOpacity>
            </Animated.View>

        </View>
    );
};

export default SocialLoginButtons;

const styles = StyleSheet.create({
    socialloginWrapper: {
        flexDirection: 'row', // Position buttons in a row
        justifyContent: 'center', // Center buttons horizontally
        alignItems: 'center', // Center buttons vertically
    },
    button: {
        width: 50, // Fixed width for circular button
        height: 50, // Fixed height for circular button
        borderRadius: 50, // Make button circular
        justifyContent: 'center', // Center the icon
        alignItems: 'center', // Center the icon
        backgroundColor: '#F6E7DF', // Button background color
        marginHorizontal: 10, // Space between buttons
        marginVertical:30,
        borderColor: Colors.primary,
        borderWidth: StyleSheet.hairlineWidth, // Optional: Add border if needed
    },
});
