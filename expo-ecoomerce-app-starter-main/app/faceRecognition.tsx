import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native';
import { ProductType } from '@/types/type';

// Added Firebase imports
import { collection, query, where, getDocs } from 'firebase/firestore'; // Added 'where' and 'getDocs'
import { db } from '@/config/firebase'; // Corrected Firebase config path

// Import TensorFlow.js libraries
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
// Import expo-image-picker
import * as ImagePicker from 'expo-image-picker';
// Import FileSystem from expo for reading image file
import * as FileSystem from 'expo-file-system';
// Import Camera
import { Camera } from 'expo-camera';

// We might need expo-camera later if user wants to use camera
// import * as Camera from 'expo-camera';

// Define a type for the prediction results
type PredictionResult = {
  className: string;
  confidence: number;
};

// Define a type for the manually recommended product
type RecommendedProductType = {
  id: string; // This will be the Firestore Document ID
  title: string;
  category: string;
  images?: string[]; // Add images field
};

const FaceRecognitionScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  // Update prediction state to hold an array of results or a string for status
  const [prediction, setPrediction] = useState<PredictionResult[] | string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading for model + analysis
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // State for manually recommended product
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProductType[]>([]);

  // Load the model and initialize TF.js on component mount
  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        // Initialize TensorFlow.js React Native backend
        await tf.ready();
        console.log('TensorFlow.js ready');
        
        // Try to set the backend, but don't fail if it doesn't work
        try {
          await tf.setBackend('rn-webgl');
          console.log('Using rn-webgl backend');
        } catch (backendError) {
          console.log('Falling back to default backend:', backendError);
        }

        // For cloud hosted model:
        const modelJson = 'https://storage.googleapis.com/tm-model/DRVbYCgyv/model.json';
        console.log('Loading model from:', modelJson);
        
        const loadedModel = await tf.loadLayersModel(modelJson);
        console.log('Model loaded successfully');
        
        // Verify the model is loaded correctly
        if (!loadedModel) {
          throw new Error('Model loaded but is null');
        }
        
        setModel(loadedModel);
        setModelLoaded(true);
      } catch (error) {
        console.error('Error loading TensorFlow.js model:', error);
        setModelLoaded(false);
        setPrediction('Failed to load model. Please check your internet connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Request camera permissions with better error handling
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('Camera permission status:', status);
        setHasPermission(status === 'granted');
        
        if (status !== 'granted') {
          console.log('Camera permission not granted');
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  // Function to scroll to results
  const scrollToResults = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Function to pick an image
  const pickImage = async () => {
    if (!modelLoaded) {
      console.log('Model not loaded yet.');
      return;
    }

    setPrediction(null);
    setImageUri(null);
    setRecommendedProducts([]); // Clear previous recommendations

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      // Automatically analyze the image after picking
      analyzeImage(uri);
      scrollToResults();
    } else if (!result.canceled) {
      console.log('Image picking cancelled.');
      setIsLoading(false);
    }
  };

  // Function to take a photo with the camera
  const takePhoto = async () => {
    if (!modelLoaded) {
      console.log('Model not loaded yet.');
      return;
    }

    if (!hasPermission) {
      alert('Camera permission is required to take photos');
      return;
    }

    setPrediction(null);
    setImageUri(null);
    setRecommendedProducts([]); // Clear previous recommendations

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        // Automatically analyze the image after taking photo
        analyzeImage(uri);
        scrollToResults();
      } else if (!result.canceled) {
          console.log('Photo taking cancelled.');
           setIsLoading(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setPrediction('Error taking photo.');
       setIsLoading(false);
    }
  };

  // Function to analyze the image
  const analyzeImage = async (uri: string) => {
    if (!model || !modelLoaded) {
      console.log('Model not available for analysis.');
      setPrediction('Error: Model not loaded. Please wait for the model to load or try again.');
      setRecommendedProducts([]);
      return;
    }

    setIsLoading(true);
    setPrediction('Analyzing...');
    setRecommendedProducts([]);

    try {
      console.log('Reading image file...');
      const imgB64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      console.log('Image read successfully');

      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      console.log('Image encoded to buffer');

      // Decode the image buffer into a tensor
      const imageTensor = decodeJpeg(new Uint8Array(imgBuffer));
      console.log('Image decoded to tensor');

      // Resize the image tensor to match the model input size
      const resizedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
      console.log('Image resized to 224x224');

      const batchedTensor = resizedTensor.expandDims(0);
      console.log('Image batched');

      // Normalize the pixel values
      const normalizedTensor = batchedTensor.div(255.0);
      console.log('Image normalized');

      // Run the prediction
      console.log('Running prediction...');
      const predictions = model.predict(normalizedTensor) as tf.Tensor;
      const values = await predictions.data();
      console.log('Prediction values:', values);

      // Get the class names
      const classNames = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];

      // Create an array of prediction results
      const results: PredictionResult[] = classNames.map((className, index) => {
        const confidenceValue = (values.length > index && typeof values[index] === 'number') ? values[index] : 0;
        return {
          className: className,
          confidence: confidenceValue * 100,
        };
      });

      // Sort results by confidence
      results.sort((a, b) => b.confidence - a.confidence);
      console.log('Sorted results:', results);

      setPrediction(results);

      // Handle skin type prediction and fetch products
      if (results.length > 0) {
        const topPrediction = results[0];
        const skinType = topPrediction.className.toLowerCase();
        console.log('Top prediction:', skinType);

        // Fetch products by skinType
        const fetchProductsBySkinType = async (type: string) => {
          try {
            console.log('Fetching products for skin type:', type);
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('skinType', '==', type));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const products: RecommendedProductType[] = querySnapshot.docs.map(doc => {
                const productData = doc.data();
                return {
                  id: doc.id,
                  title: String(productData.title || ''),
                  category: String(productData.category?.name || 'Unknown'),
                  images: Array.isArray(productData.images) ? productData.images.map(String) : [],
                };
              });
              console.log(`Found ${products.length} products for skin type: ${type}`);
              return products;
            } else {
              console.log('No products found for skin type:', type);
              return [];
            }
          } catch (error) {
            console.error('Error fetching products:', error);
            return [];
          }
        };

        const products = await fetchProductsBySkinType(skinType);
        setRecommendedProducts(products);
      }

      // Clean up tensors
      tf.dispose([imageTensor, resizedTensor, batchedTensor, normalizedTensor, predictions]);

    } catch (error) {
      console.error('Error analyzing image:', error);
      setPrediction('Error analyzing image. Please try again with a different image.');
      setRecommendedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render item for FlatList
  const renderRecommendedProduct = ({ item }: { item: RecommendedProductType }) => (
      <TouchableOpacity
          onPress={() => {
              router.push({
                  pathname: '/product-details/[id]',
                  params: {
                      id: item.id, // Use the fetched Firestore Document ID
                      productType: 'regular', // Assuming this is a regular product
                      category: item.category,
                  }
              });
          }}
          style={styles.recommendedProductItem} // Add styling for each item
      >
          {/* Put all content inside a single View */} 
          <View style={styles.recommendedProductContainer}> 
              {/* Display the first image from the fetched images array */}
              {item.images && item.images.length > 0 && (
                  <Image source={{ uri: item.images[0] }} style={styles.recommendedProductImage} />
              )}
              {/* Container for product title to handle flex behavior */} 
              <View style={styles.recommendedProductTextContainer}>
                  <Text style={styles.recommendedProductTitleSimple}>
                      {item.title}
                  </Text>
              </View>
          </View>
      </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Face Recognition',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.primary,
          },
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading model or analyzing...</Text>
          </View>
        )}

        {!isLoading && !modelLoaded && (
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>Failed to load model. Please check your internet connection and model URL.</Text>
           </View>
        )}

        {!isLoading && modelLoaded && (
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* <Text style={styles.title}>Analyze Your Skin</Text> */}
            {/* <Text style={styles.description}>
              Upload a clear picture of your face to get a skin type analysis.
            </Text> */}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage} disabled={isLoading}>
                <Ionicons name="image" size={24} color={Colors.white} />
                <Text style={styles.buttonText}>Pick Image from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={isLoading}>
                <Ionicons name="camera" size={24} color={Colors.white} />
                <Text style={styles.buttonText}>Take a Photo</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View style={styles.imageDisplayContainer}>
                <Text style={styles.imageLabel}>Selected Image:</Text>
                <Image source={{ uri: imageUri }} style={styles.largePreviewImage} />
                 {/* Optionally add a re-analyze button here */}
              </View>
            )}

            {/* Displaying prediction results as a list */}
            {Array.isArray(prediction) && ( // Check if prediction is the results array
              <View style={styles.predictionResultsContainer}>
                <Text style={styles.predictionSectionTitle}>Analysis Result:</Text>
                {
                  prediction.map((result, index) => (
                    <View key={index} style={styles.resultItem}>
                      <Text style={styles.resultClassName}>{result.className}</Text>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${result.confidence}%` }]} />
                      </View>
                      <Text style={styles.confidenceTextRight}>{result.confidence.toFixed(2)}%</Text>
                    </View>
                  ))
                }
              </View>
            )}

            {/* Displaying status messages */}
            {typeof prediction === 'string' && (
                 <View style={styles.predictionResultsContainer}>
                  <Text style={styles.predictionSectionTitle}>Status:</Text>
                  <Text style={styles.predictionTextResult}>{prediction}</Text>
                </View>
            )}

            {/* Section to display recommended products (now fetched by skinType) */}
            {recommendedProducts.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Skincare products that suit your skin:</Text>
                <Text style={styles.instructionText}>Tap on a product from our store to view details or order.</Text>
                <FlatList
                  data={recommendedProducts}
                  keyExtractor={(item) => item.id} // Use product ID as key
                  renderItem={renderRecommendedProduct}
                  horizontal={false} // Set to false for vertical scrolling
                  contentContainerStyle={styles.flatListContentContainer} // Optional: add padding/styling to FlatList content
                  showsHorizontalScrollIndicator={false} // Hide horizontal scroll indicator
                  showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
                  scrollEnabled={false} // Disable scrolling for the FlatList itself to avoid nesting issues
                />
              </View>
            )}
            {/* End Recommended Products Display */}

          </ScrollView>
        )}

      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray,
  },
   errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.red,
    textAlign: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
    gap: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  imageDisplayContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
   imageLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 10,
  },
  largePreviewImage: {
    width: '90%', // Adjust size as needed
    height: 300, // Adjust height as needed
    borderRadius: 10,
    resizeMode: 'contain',
  },
  predictionResultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.white,
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  predictionSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  resultClassName: {
    fontSize: 16,
    color: Colors.black,
    width: 120,
    marginRight: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 30,
    backgroundColor: Colors.lightGray,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  confidenceTextRight: {
    fontSize: 12,
    color: Colors.black,
    fontWeight: 'bold',
    width: 70,
    textAlign: 'right',
  },
  predictionTextResult: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recommendedProductTitleSimple: {
    fontSize: 14,
    color: Colors.black,
    textAlign: 'left',
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recommendationsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.white,
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  recommendedProductContainer: {
    flexDirection: 'row', // Arrange image and text horizontally
    alignItems: 'center', // Align items vertically in the center
    marginTop: 10,
    gap: 15, // Add space between image and text
    width: '100%', // Ensure container takes full width of item
  },
  recommendedProductImage: {
    width: 60, // Adjust size as needed
    height: 60, // Adjust size as needed
    borderRadius: 30, // Make it round if desired
    resizeMode: 'cover', // Cover the area
  },
  recommendedProductTextContainer: {
    flex: 1, // Allow text container to take available space
    paddingRight: 5, // Add a little padding on the right
  },
  recommendedProductItem: {
    marginBottom: 15, // Add spacing between vertical items
    width: '100%', // Allow items to take full width in vertical list
    paddingHorizontal: 10, // Add some horizontal padding
    alignItems: 'center', // Center content within each item
  },
  flatListContentContainer: {
    paddingVertical: 10, // Add padding to the top and bottom of the FlatList
    alignItems: 'center', // Center items in the list horizontally
  },
  instructionText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic', // Optional: make it italic
  },
});

export default FaceRecognitionScreen;