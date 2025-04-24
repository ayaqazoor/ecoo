import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase"; // استيراد auth من إعدادات Firebase

const OAuth = () => {
  // دالة لتسجيل الدخول باستخدام حساب جوجل
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider); // تسجيل الدخول باستخدام حساب جوجل
      // يمكنك هنا الحصول على بيانات المستخدم بعد تسجيل الدخول بنجاح
      Alert.alert("تم تسجيل الدخول باستخدام جوجل");
    } catch (error) {
      if (error instanceof Error) {
        // التعامل مع الأخطاء من نوع Error أو AuthError
        Alert.alert("حدث خطأ في تسجيل الدخول", error.message);
      } else {
        // في حال كان الخطأ من نوع آخر
        Alert.alert("حدث خطأ غير معروف");
      }
    }
  };

  return (
    <View style={styles.dividerContainer}>
      <View style={styles.line} />
      <Text style={styles.orText}>or</Text>
      <View style={styles.line} />
      
      {/* زر تسجيل الدخول باستخدام جوجل */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={handleGoogleSignIn} // عند الضغط على الزر، نفذ دالة تسجيل الدخول
      >
        <Ionicons name="logo-google" size={24} color="white" />
        <Text style={styles.socialButtonText}>Sign In with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OAuth;

// الأنماط (Styles)
const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#db4437', // لون خلفية جوجل
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});