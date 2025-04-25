const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const dbData = require('./db.json');

const firebaseConfig = {
  apiKey: "AIzaSyB5DT4u3PFRrbnID1CqQ49K_y8kpQJrzRY",
  authDomain: "mh-giftif.firebaseapp.com",
  projectId: "mh-giftif",
  storageBucket: "mh-giftif.appspot.com",
  messagingSenderId: "897071317692",
  appId: "1:897071317692:web:be9cb7bab4987bc32646b9",
  measurementId: "G-B0PKK39BK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadCategories() {
  try {
    // Extract unique categories from products and saleProducts
    const allProducts = [...dbData.products, ...dbData.saleProducts];
    const uniqueCategories = new Map();
    
    allProducts.forEach(product => {
      if (product.category && !uniqueCategories.has(product.category.id)) {
        uniqueCategories.set(product.category.id, product.category);
      }
    });

    // Upload categories to Firestore
    const categoriesCollection = collection(db, 'categories');
    for (const [id, category] of uniqueCategories) {
      await addDoc(categoriesCollection, {
        id: Number(id),
        name: category.name,
        image: category.image
      });
      console.log(`Uploaded category: ${category.name}`);
    }
    console.log('All categories uploaded successfully!');
  } catch (error) {
    console.error('Error uploading categories:', error);
  }
}

// Run the upload function
async function main() {
  console.log('Starting categories upload process...');
  await uploadCategories();
  console.log('Categories upload process completed!');
}

main(); 