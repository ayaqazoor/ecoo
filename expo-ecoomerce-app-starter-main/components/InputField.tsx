import { StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

type Props = {}

const InputField = (props: React.ComponentProps<typeof TextInput> ) => {
  return (
      <TextInput {...props}

       style={styles.inputField} />
    
  )
}

export default InputField

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: Colors.beige, 
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'stretch',
    borderRadius: 25, // زوايا دائرية
    fontSize: 16, 
    color: Colors.black,
    marginBottom: 20,
  },
})