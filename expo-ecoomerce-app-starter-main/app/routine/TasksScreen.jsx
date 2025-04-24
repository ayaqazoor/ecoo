import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TasksScreen = () => {
  const router = useRouter();
  const mainColor = '#F6EEEB';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: '#FFB6C1' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={mainColor} />
        </TouchableOpacity>
        <Text style={styles.title}>Smart Girl 🎀</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Care Boxes */}
      <View style={styles.careContainer}>
        <TouchableOpacity style={styles.careBox} onPress={() => router.push('../routine/MorningCareScreen')}>
          <Text style={styles.careText}>Morning Care 🌞</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.careBox} onPress={() => router.push('../routine/EveningCareScreen')}>
          <Text style={styles.careText}>Evening Care 🌙</Text>
        </TouchableOpacity>

        {/* Skin Tips Box */}
        <TouchableOpacity style={styles.careBox} onPress={() => router.push('../routine/SkinTipsScreen')}>
          <Text style={styles.careText}>Skin Tips 💖</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: mainColor }]}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  careContainer: {
    flexDirection: 'column', // Aligning boxes vertically
    justifyContent: 'flex-start', // Starting the alignment from the top
    paddingHorizontal: 10,
    flex: 1, // Take the remaining space of the screen
  },
  careBox: {
    backgroundColor: '#F6EEEB',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: '100%', // Full width of the screen
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginVertical: 10, // Space between boxes
  },
  careText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 70,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  plus: {
    fontSize: 30,
    color: '#000',
    textAlign: 'center',
  },
});
