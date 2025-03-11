import { View, Text, StyleSheet } from "react-native";
import SocialLoginButtons from "./SocialLoginButtons";

// دالة تسجيل الدخول عبر Google (يجب استبدالها بوظيفتك الفعلية)
const signInWithGoogle = async () => {
    try {
        console.log("Logging in with Google...");
        // ضع هنا كود تسجيل الدخول عبر Google
    } catch (error) {
        console.error("Google login error:", error);
    }
};

const OAuth = () => (
    <View>
        {/* خط فاصل مع "Or" في المنتصف */}
        <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.line} />
        </View>

        {/* زر تسجيل الدخول عبر Google */}
        <SocialLoginButtons 
            emailHref="/signup"
            onGooglePress={signInWithGoogle}
            googleTitle="Continue with Google"
        />
    </View>
);

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
