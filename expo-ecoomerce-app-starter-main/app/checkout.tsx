import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, FlatList, KeyboardTypeOptions
} from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import DropDownPicker from 'react-native-dropdown-picker';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { total: rawTotal } = useLocalSearchParams();
  const productTotal = parseFloat(rawTotal as string) || 0;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState<'westbank' | 'inside48'>('westbank');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [cities, setCities] = useState([
    { label: 'Nablus', value: 'Nablus' },
    { label: 'Ramallah', value: 'Ramallah' },
    { label: 'Hebron', value: 'Hebron' },
    { label: 'Jenin', value: 'Jenin' },
    { label: 'Tulkarm', value: 'Tulkarm' },
    { label: 'Jerusalem', value: 'Jerusalem' },
  ]);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const deliveryFee = region === 'westbank' ? 20 : 60;
  const finalTotal = productTotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!name || !phone || !address || !city) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      Alert.alert('Card Information Missing', 'Please fill in card details.');
      return;
    }

    Alert.alert('Order Confirmed', `Your order was placed successfully!\nTotal: ₪${finalTotal}`);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Checkout</Text>

      {/* اسم، رقم، عنوان */}
      <FlatList
        data={[
          {
            label: 'Full Name',
            value: name,
            onChange: setName,
            keyboardType: 'default' as KeyboardTypeOptions,
          },
          {
            label: 'Phone Number',
            value: phone,
            onChange: setPhone,
            keyboardType: 'phone-pad' as KeyboardTypeOptions,
          },
          {
            label: 'Address',
            value: address,
            onChange: setAddress,
            keyboardType: 'default' as KeyboardTypeOptions,
          },
        ]}
        keyExtractor={(item) => item.label}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TextInput
            style={styles.input}
            placeholder={item.label}
            value={item.value}
            onChangeText={item.onChange}
            keyboardType={item.keyboardType}
            placeholderTextColor="#888"
          />
        )}
        ListFooterComponent={() => (
          <>
            {/* City Dropdown */}
            <Text style={styles.label}>City</Text>
            <DropDownPicker
              open={open}
              value={city}
              items={cities}
              setOpen={setOpen}
              setValue={setCity}
              setItems={setCities}
              placeholder="Select a city"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={{ color: '#000' }}
            />

            {/* Region Selection */}
            <Text style={styles.label}>Region</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity onPress={() => setRegion('westbank')} style={styles.radio}>
                <Text style={region === 'westbank' ? styles.selected : styles.unselected}>●</Text>
                <Text style={styles.optionText}>West Bank (₪20)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRegion('inside48')} style={styles.radio}>
                <Text style={region === 'inside48' ? styles.selected : styles.unselected}>●</Text>
                <Text style={styles.optionText}>Inside 48 (₪60)</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={styles.radio}>
                <Text style={paymentMethod === 'cash' ? styles.selected : styles.unselected}>●</Text>
                <Text style={styles.optionText}>Cash on Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPaymentMethod('card')} style={styles.radio}>
                <Text style={paymentMethod === 'card' ? styles.selected : styles.unselected}>●</Text>
                <Text style={styles.optionText}>Pay with Card</Text>
              </TouchableOpacity>
            </View>

            {/* Card Info */}
            {paymentMethod === 'card' && (
              <FlatList
                data={[
                  {
                    label: 'Card Number',
                    value: cardNumber,
                    onChange: setCardNumber,
                    keyboardType: 'numeric' as KeyboardTypeOptions,
                  },
                  {
                    label: 'Expiry Date (MM/YY)',
                    value: expiryDate,
                    onChange: setExpiryDate,
                    keyboardType: 'default' as KeyboardTypeOptions,
                  },
                  {
                    label: 'CVV',
                    value: cvv,
                    onChange: setCvv,
                    keyboardType: 'numeric' as KeyboardTypeOptions,
                  },
                ]}
                keyExtractor={(item) => item.label}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TextInput
                    style={styles.input}
                    placeholder={item.label}
                    value={item.value}
                    onChangeText={item.onChange}
                    keyboardType={item.keyboardType}
                    placeholderTextColor="#888"
                  />
                )}
              />
            )}

            {/* Total & Button */}
            <Text style={styles.total}>Products Total: ₪{productTotal.toFixed(2)}</Text>
            <Text style={styles.total}>Delivery Fee: ₪{deliveryFee}</Text>
            <Text style={[styles.total, { fontSize: 20, color: Colors.primary }]}>
              Final Total: ₪{finalTotal.toFixed(2)}
            </Text>

            <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
              <Text style={styles.buttonText}>Place Order</Text>
            </TouchableOpacity>
          </>
        )}
      />
    </View>
  );
};

export const unstable_settings = {
  headerShown: false,
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 30,
    textAlign: "center",
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: Colors.gray,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  dropdown: {
    borderColor: '#ccc',
    marginBottom: 15,
    height: 40,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    color: Colors.primary,
    fontSize: 18,
    marginRight: 5,
  },
  unselected: {
    color: Colors.lightGray,
    fontSize: 18,
    marginRight: 5,
  },
  optionText: {
    fontSize: 16,
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
