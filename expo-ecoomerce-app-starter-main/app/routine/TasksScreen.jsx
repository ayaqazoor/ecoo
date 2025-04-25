import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TasksScreen = () => {
  const router = useRouter();
  const mainColor = '#F6EEEB';

  return (
    <SafeAreaView style={styles.safeArea}>
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

          <TouchableOpacity style={styles.careBox} onPress={() => router.push('../routine/SkinTipsScreen')}>
            <Text style={styles.careText}>Skin Tips 💖</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: mainColor }]}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Hide default header from Expo Router
export const unstable_settings = {
  initialRouteName: 'TasksScreen',
};

const TasksScreenWrapper = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TasksScreen />
    </>
  );
};

export default TasksScreenWrapper;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  careContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  careBox: {
    backgroundColor: '#F6EEEB',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginVertical: 10,
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
