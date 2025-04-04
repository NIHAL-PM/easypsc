
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMS-1zcxPyoR5_FXoRM3ORTEbA_S-HIFI",
  authDomain: "easypsc-40aaa.firebaseapp.com",
  projectId: "easypsc-40aaa",
  storageBucket: "easypsc-40aaa.firebasestorage.app",
  messagingSenderId: "962049939072",
  appId: "1:962049939072:web:a9c36e6eedcba6ca3a3865"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Helper function for Firebase callable functions
export const callFunction = async (functionName: string, data: any) => {
  try {
    const functionRef = httpsCallable(functions, functionName);
    const result = await functionRef(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
};
