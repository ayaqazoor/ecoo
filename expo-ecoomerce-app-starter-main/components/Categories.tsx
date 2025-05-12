import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import { CategoryType } from '@/types/type';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

type Props = {
  categories: CategoryType[];
};
const CATEGORY_MAPPINGS: CategoryType[] = [
  { id: '5', name: 'Makeup', image: 'https://i.imgur.com/noVwrND.jpeg' },
  { id: '1', name: 'Body Care', image: 'https://i.imgur.com/KLzx1cJ.jpeg' },
  { id: '6', name: 'Hair Care', image: 'https://i.imgur.com/C00V1xi.jpeg' },
  { id: '2', name: 'Skin Care', image: 'https://i.imgur.com/4Sl0T57.jpeg' },
  { id: '4', name: 'Handbags', image: 'https://i.imgur.com/4HNOht7.jpeg' },
  { id: '9', name: 'Gifts', image: 'https://i.imgur.com/kzRtLnL.jpeg' },
  { id: '7', name: 'Perfumes', image: 'https://i.imgur.com/f9HHKw0.jpeg' },
  { id: '3', name: 'Accessories', image: 'https://i.imgur.com/GGb2nRQ.jpeg' },
  { id: '8', name: 'Watches', image: 'https://i.imgur.com/6ICnLqz.jpeg' },
];

const Categories = ({ categories }: Props) => {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    switch (categoryId) {
      case '5':
        router.push('/makeup');
        break;
      case '1':
        router.push('/bodyCare');
        break;
      case '6':
        router.push('/hairCare');
        break;
      case '2':
        router.push('/skinCare');
        break;
      case '4':
        router.push('/handBag');
        break;
      case '9':
        router.push('/gift');
        break;
      case '7':
        router.push('/perfumes');
        break;
      case '3':
        router.push('/accessories');
        break;
      case '8':
        router.push('/watches');
        break;
      default:
        console.warn('No page linked for category ID:', categoryId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={() => router.push('/explore')}>
          <Text style={styles.titleBtn}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCategoryPress(item.id)}>
            <View style={styles.item}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.itemImg, { backgroundColor: Colors.lightGray }]} />
              )}
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: Colors.primary,
  },
  titleBtn: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.6,
    color: Colors.primary,
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  item: {
    alignItems: 'center',
    marginRight: 20,
    marginVertical: 10,
    gap: 8,
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lightGray,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
  },
});

export default Categories;