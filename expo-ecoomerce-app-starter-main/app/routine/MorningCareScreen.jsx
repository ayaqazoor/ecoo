import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const MorningCareScreen = () => {
  const router = useRouter();
  const headerColor = '#FFB6C1';
  const backgroundColor = '#F6EEEB';
  const [sound, setSound] = useState();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);

  const initialSteps = [
    { title: 'Facial Cleanser 🧼', notes: [], input: '', showInput: false },
    { title: 'Toner 💧', notes: [], input: '', showInput: false },
    { title: 'Serum ✨', notes: [], input: '', showInput: false },
    { title: 'Moisturizer 🍃', notes: [], input: '', showInput: false },
    { title: 'Sunscreen ☀️', notes: [], input: '', showInput: false },
  ];

  const [steps, setSteps] = useState(initialSteps);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/success.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleAddNote = (index) => {
    const updatedSteps = [...steps];
    const note = updatedSteps[index].input.trim();
    if (note) {
      updatedSteps[index].notes.push(note);
      updatedSteps[index].input = '';
      setSteps(updatedSteps);
    }
  };

  const toggleInput = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index].showInput = !updatedSteps[index].showInput;
    setSteps(updatedSteps);
  };

  const handleCheck = async (stepIndex, noteIndex) => {
    setSelectedStepIndex(stepIndex);
    setSelectedNoteIndex(noteIndex);
    await playSound();
    setModalVisible(true);
  };

  const handleConfirm = () => {
    if (selectedStepIndex !== null && selectedNoteIndex !== null) {
      const updatedSteps = [...steps];
      updatedSteps[selectedStepIndex].notes.splice(selectedNoteIndex, 1);
      setSteps(updatedSteps);
      setSelectedStepIndex(null);
      setSelectedNoteIndex(null);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Morning Care 🌞</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Steps */}
      <ScrollView contentContainerStyle={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={[styles.stepBox, { backgroundColor }]}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepText}>{step.title}</Text>
              <TouchableOpacity onPress={() => toggleInput(index)} style={styles.plusButton}>
                <Text style={styles.plus}>+</Text>
              </TouchableOpacity>
            </View>

            {step.showInput && (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Write here..."
                  style={styles.input}
                  value={step.input}
                  onChangeText={(text) => {
                    const updatedSteps = [...steps];
                    updatedSteps[index].input = text;
                    setSteps(updatedSteps);
                  }}
                  onSubmitEditing={() => handleAddNote(index)}
                />
              </View>
            )}

            {step.notes.map((note, i) => (
              <View key={i} style={styles.noteRow}>
                <TouchableOpacity
                  style={styles.checkCircle}
                  onPress={() => handleCheck(index, i)}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Custom Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>عاش يا أشطر بنوتة 🎀</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.okButton}>
              <Text style={styles.okButtonText}>تم</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MorningCareScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepsContainer: {
    padding: 20,
    gap: 16,
  },
  stepBox: {
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB6C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    fontSize: 22,
    color: '#fff',
  },
  inputContainer: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFB6C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  okButton: {
    backgroundColor: '#FFB6C1',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});