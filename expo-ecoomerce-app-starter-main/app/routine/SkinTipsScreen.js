// SkinTipsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SkinTipsScreen = () => {
  const router = useRouter();

  const tips = [
    "Drink plenty of water 💧",
    "Use sunscreen daily ☀️",
    "Never sleep with makeup on 💤",
    "Exfoliate twice a week 🧽",
    "Moisturize morning and night 🧴",
    "Eat fruits and veggies 🥗",
    "Use gentle cleansers 🧼",
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Skin Tips 💖</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipBox}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SkinTipsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    backgroundColor: '#FFB6C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  tipBox: {
    backgroundColor: '#FFE4E1',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});