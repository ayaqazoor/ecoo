import { View, Text, StyleSheet } from "react-native";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import tailwindcss from 'tailwindcss';
const OAuth =() => (
        <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
            <View className="flex-1 h-[1px] bg-general-100"/>
            <Text className="text-lg"> or </Text>
            <View className="flex-1 h-[1px] bg-general-100"/>
        </View>
   
    
    
)
export default OAuth;

// الأنماط (Styles)
const styles = StyleSheet.create({
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30, // يضيف مسافة بين العناصر العلوية والسفلية
    },
    line: {
        flex: 1, // يجعل الخط يأخذ المساحة المتاحة بالتساوي
        height: 1.5, // زيادة السماكة قليلاً
        backgroundColor: '#ccc', // لون الخط
    },
    orText: {
        marginHorizontal: 10, // تباعد جانبي من الخطوط
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
    },
});
