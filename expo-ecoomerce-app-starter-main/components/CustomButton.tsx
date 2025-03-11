import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;  // لتغيير النص
  onPress: () => void;  // وظيفة الزر عند الضغط
  backgroundColor?: string;  // لون الزر (اختياري)
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, backgroundColor = "#5E4033" }) => {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    alignSelf: "stretch",
    alignItems: "center",
    borderRadius: 25,
    marginBottom: 20,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
