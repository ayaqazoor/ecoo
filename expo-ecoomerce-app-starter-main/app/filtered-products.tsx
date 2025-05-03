// components/FilterSidebar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";


const categories = [
  { id: 2, name: "Skin Care" },
  { id: 4, name: "Hand Bags" },
  { id: 3, name: "Accessories" },
  { id: 7, name: "Perfumes" },
  { id: 1, name: "Body Care" },
  { id: 5, name: "Makeup" },
  { id: 6, name: "Hair Care" },
  { id: 8, name: "Watches" },
  { id: 9, name: "Gift" },
];

const FilterSidebar = ({ selectedCategory, setSelectedCategory, minPrice, setMinPrice, maxPrice, setMaxPrice }: any) => {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Filter</Text>
      <Text>Select Category:</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value: any) => setSelectedCategory(value)}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value={null} />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <Text>Price Range:</Text>
      <Slider
        minimumValue={0}
        maximumValue={500}
        step={1}
        value={minPrice}
        onValueChange={(value: any) => setMinPrice(value)}
      />
      <Text>${minPrice}</Text>
      <Slider
        minimumValue={minPrice}
        maximumValue={500}
        step={1}
        value={maxPrice}
        onValueChange={(value: any) => setMaxPrice(value)}
      />
      <Text>${maxPrice}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default FilterSidebar;
