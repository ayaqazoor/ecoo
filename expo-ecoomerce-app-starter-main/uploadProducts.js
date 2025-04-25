const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration
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

// Read the db.json file
const rawData = fs.readFileSync('./db.json');
const data = JSON.parse(rawData);

async function uploadProducts() {
  try {
    // Upload regular products
    console.log('Uploading regular products...');
    for (const product of data.products) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Uploaded product: ${product.title}`);
    }

    // Upload sale products
    console.log('Uploading sale products...');
    for (const product of data.saleProducts) {
      await addDoc(collection(db, 'saleProducts'), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Uploaded sale product: ${product.title}`);
    }

    console.log('All products have been uploaded successfully!');
  } catch (error) {
    console.error('Error uploading products:', error);
  }
}

uploadProducts(); 