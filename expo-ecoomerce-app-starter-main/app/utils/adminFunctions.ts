import { auth, db } from "@/config/firebase"; // استيراد auth و db من ملف firebase.js
import { collection, addDoc, doc, deleteDoc, getDoc } from "firebase/firestore";

// دالة إضافة منتج
export const addProduct = async (productDetails: { name: string; price: number; description: string }) => {
  try {
    const docRef = await addDoc(collection(db, "products"), productDetails);
    console.log("Product added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding product: ", e);
  }
};

// دالة حذف منتج
export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, "products", productId));
    console.log("Product deleted successfully");
  } catch (e) {
    console.error("Error deleting product: ", e);
  }
};

// دالة للتحقق من إذا كان المستخدم "Admin"
export const checkIfAdmin = async () => {
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().role === "admin") {
      return true;
    }
  }
  return false;
};
