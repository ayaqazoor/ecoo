import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';

const faqData = [
  {
    question: 'How long does delivery take inside/outside the city?',
    answer: 'Delivery takes 2-3 business days inside/outside the city.',
  },
  {
    question: 'What is the delivery cost?',
    answer: 'Delivery cost: ₪20 for West Bank, ₪60 for 48 areas.',
  },
  {
    question: 'What is the return policy?',
    answer: 'We do not have a return policy, but you can exchange within 3 days after receiving your order.',
  },
  {
    question: 'Do you offer gift packages?',
    answer: 'Yes, we have ready-made gift packages, and you can also customize your own package which will be wrapped as you wish.',
  },
  {
    question: 'Is there a way to contact you if I have any questions?',
    answer: 'You can contact us on WhatsApp at ',
    whatsappNumber: '+972 59‑791‑9146',
    isWhatsApp: true,
  },
];

export default function FAQ() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  const showAnswer = (item: any) => {
    setSelectedItem(item);
    setSelectedAnswer(item.answer);
  };

  const handleWhatsAppPress = async () => {
    const phoneNumber = '972597919146';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    try {
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#7a5c2e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
        </View>
        <ScrollView style={styles.container}>
          {/* <Text style={styles.header}>الأسئلة الشائعة</Text> */}
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity onPress={() => showAnswer(item)}>
                <View style={styles.questionBubble}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={selectedAnswer !== null}
          onRequestClose={() => setSelectedAnswer(null)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setSelectedAnswer(null)}
          >
            <View style={styles.modalContent}>
              {selectedItem?.isWhatsApp ? (
                <View style={styles.whatsappContainer}>
                  <Text style={styles.modalAnswer}>{selectedAnswer}</Text>
                  <TouchableOpacity onPress={handleWhatsAppPress}>
                    <Text style={styles.whatsappNumber}>
                      {selectedItem.whatsappNumber}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.modalAnswer}>{selectedAnswer}</Text>
              )}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedAnswer(null)}
              >
                <Ionicons name="close" size={24} color="#7a5c2e" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  questionBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#d3d3d3',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  answerBubble: {
    backgroundColor: '#f8f4ee',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginTop: 2,
    marginLeft: 16,
    marginRight: 16,
  },
  faqQuestion: {
    color: '#7a5c2e',
    fontSize: 18,
    fontWeight: 'normal',
  },
  faqAnswer: {
    color: '#7a5c2e',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: '#f8f4ee',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7a5c2e',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#d3d3d3',
  },
  modalAnswer: {
    color: '#7a5c2e',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  whatsappContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappNumber: {
    color: '#25D366',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
});