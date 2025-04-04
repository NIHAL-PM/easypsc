
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, ExamType } from '@/types';

// Firebase auth error handling
export const getErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return error?.message || 'An unexpected error occurred. Please try again.';
  }
};

// Register a new user
export const registerUser = async (
  email: string, 
  password: string,
  name: string,
  examType: ExamType,
  preferredLanguage: string
): Promise<User> => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update profile with name
    await updateProfile(firebaseUser, {
      displayName: name
    });
    
    // Create user profile in Firestore
    const user: User = {
      id: firebaseUser.uid,
      name,
      email,
      examType,
      preferredLanguage,
      isPremium: false,
      monthlyQuestionsRemaining: 10,
      questionsAnswered: 0,
      questionsCorrect: 0,
      currentStreak: 0,
      lastActive: new Date(),
      lastQuestionTime: null,
      weakCategories: {},
      strongCategories: {}
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), user);
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      // Update last active
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastActive: new Date()
      });
      
      return userDoc.data() as User;
    } else {
      // Create a basic profile if one doesn't exist yet
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email,
        examType: 'UPSC',
        preferredLanguage: 'english',
        isPremium: false,
        monthlyQuestionsRemaining: 10,
        questionsAnswered: 0,
        questionsCorrect: 0,
        currentStreak: 0,
        lastActive: new Date(),
        lastQuestionTime: null,
        weakCategories: {},
        strongCategories: {}
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), user);
      
      return user;
    }
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out user
export const logOut = async (): Promise<void> => {
  return signOut(auth);
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Convert Firebase user to app user
export const getUserFromFirebase = async (firebaseUser: FirebaseUser | null): Promise<User | null> => {
  if (!firebaseUser) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    
    // If no profile in Firestore yet
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || '',
      examType: 'UPSC',
      preferredLanguage: 'english',
      isPremium: false,
      monthlyQuestionsRemaining: 10,
      questionsAnswered: 0,
      questionsCorrect: 0,
      currentStreak: 0,
      lastActive: new Date(),
      lastQuestionTime: null,
      weakCategories: {},
      strongCategories: {}
    };
  } catch (error) {
    console.error('Error getting user from Firebase:', error);
    return null;
  }
};
