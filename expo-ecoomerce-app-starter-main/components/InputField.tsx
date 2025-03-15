import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type InputFieldProps = React.ComponentProps<typeof TextInput> & {
  icon?: keyof typeof Ionicons.glyphMap; // يضمن أن `icon` اسم صحيح من أيقونات Ionicons
};

const InputField = ({ icon, style, ...props }: InputFieldProps) => {
  return (
    <View style={styles.inputContainer}>
      {/* عرض الأيقونة فقط إذا كانت موجودة */}
      {icon && <Ionicons name={icon} size={22} color={Colors.primary} style={styles.icon} />}
      <TextInput {...props} style={[styles.inputField, style]} />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.beige,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
});