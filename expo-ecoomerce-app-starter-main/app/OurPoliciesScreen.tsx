import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

const OurPoliciesScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>📜 Our Policies</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>🔐 Privacy Policy</Text>
        <Text style={styles.text}>
          We value your privacy . All your personal data is securely stored and will not be shared without your consent .
        </Text>

        <Text style={styles.sectionTitle}>📋 Terms of Use</Text>
        <Text style={styles.text}>
          By using our app, you agree to our rules and conditions . Any misuse may result in restricted access .
        </Text>

        <Text style={styles.sectionTitle}>🔁 Exchange Policy</Text>
        <Text style={styles.text}>
          Sorry, returns ❌ are not accepted. However, you may exchange items within **3 days** of receiving your order 📦,
          as long as the product is in good condition .
        </Text>

        <Text style={[styles.text, { marginTop: 8 }]}>

            
          To request an exchange, please contact us via WhatsApp 📱 at:{" "}
          <Text style={{ fontWeight: "bold" }}>+972 59-537-5870</Text> 💬
        </Text>
      </ScrollView>
    </View>
  );
};

export default OurPoliciesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  backIcon: {
    paddingRight: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    color: Colors.primary,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
});
