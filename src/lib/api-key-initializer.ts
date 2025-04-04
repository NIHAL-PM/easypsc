
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Initialize API keys with defaults when needed
export const initializeDefaultGeminiKey = async () => {
  try {
    // Try to get API key from local storage first
    const localGeminiKey = localStorage.getItem('GEMINI_API_KEY');
    if (localGeminiKey) {
      return true;
    }
    
    // If not in local storage, check Firebase Firestore
    if (auth.currentUser) {
      const settingDoc = await getDoc(doc(db, "settings", 'GEMINI_API_KEY'));
      if (settingDoc.exists() && settingDoc.data()?.value) {
        localStorage.setItem('GEMINI_API_KEY', settingDoc.data().value);
        console.log('Initialized Gemini API key from Firestore');
        return true;
      }
    }
    
    // No key found
    console.log('No Gemini API key found');
    return false;
  } catch (error) {
    console.error('Error initializing Gemini API key:', error);
    return false;
  }
};

// Initialize default News API key
export const initializeDefaultNewsKey = async () => {
  try {
    // Try to get API key from local storage first
    const localNewsKey = localStorage.getItem('NEWS_API_KEY');
    if (localNewsKey) {
      return true;
    }
    
    // Default News API key
    const defaultNewsKey = '7c64a4f4675a425ebe9fc4895fc6e273';
    
    // Save to local storage
    localStorage.setItem('NEWS_API_KEY', defaultNewsKey);
    console.log('Initialized default News API key');
    
    // If user is authenticated, save to Firestore too
    if (auth.currentUser) {
      await setDoc(doc(db, "settings", 'NEWS_API_KEY'), {
        value: defaultNewsKey,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: auth.currentUser.uid
      }, { merge: true });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing News API key:', error);
    return false;
  }
};
