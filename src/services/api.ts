
import { db, callFunction, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { ExamType, Question, QuestionDifficulty, User, UserStats } from '@/types';

interface GenerateQuestionsOptions {
  examType: ExamType;
  difficulty: QuestionDifficulty;
  count: number;
  askedQuestionIds?: string[];
  language?: string;
}

// Helper function to save API keys
export const saveApiKey = async (key: string, value: string) => {
  try {
    // First save to localStorage for immediate use
    localStorage.setItem(key, value);
    
    // Then save to Firestore for persistence (if user is authenticated)
    if (auth.currentUser) {
      await setDoc(doc(db, "settings", key), {
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: auth.currentUser.uid
      }, { merge: true });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

// Helper function to get API keys 
export const getApiKey = async (key: string): Promise<string | null> => {
  try {
    // First check localStorage for immediate access
    const localValue = localStorage.getItem(key);
    if (localValue) {
      return localValue;
    }
    
    // If not in localStorage and user is authenticated, try to get from Firestore
    if (auth.currentUser) {
      const settingDoc = await getDoc(doc(db, "settings", key));
      if (settingDoc.exists()) {
        const data = settingDoc.data();
        if (data?.value) {
          localStorage.setItem(key, data.value);
          return data.value;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
};

export const generateQuestions = async (options: GenerateQuestionsOptions): Promise<Question[]> => {
  try {
    console.log('Generating questions with params:', options);
    
    // Use Firebase callable function
    const data = await callFunction('generateQuestions', options);
    
    console.log('Generated questions:', data?.questions);
    return data?.questions || [];
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    return [];
  }
};

/**
 * Generates chat responses using AI
 */
export const generateChat = async (userMessage: string): Promise<string | null> => {
  try {
    console.log('Generating chat response');
    
    // Use Firebase callable function
    const data = await callFunction('generateChat', { prompt: userMessage });
    
    // Return the chat response
    return data?.response || null;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return null;
  }
};

/**
 * Get chat messages for a specific exam category
 */
export const getChatMessages = async (examType: ExamType) => {
  try {
    const messagesRef = collection(db, "chat_messages");
    const q = query(
      messagesRef, 
      where("examCategory", "==", examType),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return messages.reverse();
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (examType: ExamType, userId: string, userName: string, message: string) => {
  try {
    const messageData = {
      examCategory: examType,
      userId,
      userName,
      message,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "chat_messages"), messageData);
    
    return {
      id: docRef.id,
      ...messageData
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    return null;
  }
};

/**
 * Get news articles
 */
export const getNewsArticles = async (category: string = 'general') => {
  try {
    // Use Firebase callable function
    const data = await callFunction('getNews', { category });
    
    return data?.articles || [];
  } catch (error) {
    console.error('Error getting news articles:', error);
    return [];
  }
};

/**
 * Tracks user activity for analytics
 */
export const trackUserActivity = async (
  userId: string,
  action: string,
  details: Record<string, any> = {}
) => {
  try {
    await addDoc(collection(db, "user_activities"), {
      userId,
      action,
      details,
      createdAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error storing user activity:', error);
    return false;
  }
};

/**
 * Get user statistics from Firestore
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userProgressDoc = await getDoc(doc(db, "user_progress", userId));
    
    if (userProgressDoc.exists()) {
      const data = userProgressDoc.data();
      
      return {
        totalQuestions: data?.questionsAttempted || 0,
        correctAnswers: data?.questionsCorrect || 0,
        accuracyPercentage: data?.questionsAttempted && data.questionsAttempted > 0 
          ? ((data.questionsCorrect || 0) / data.questionsAttempted) * 100 
          : 0,
        weakCategories: data?.weakCategories || [],
        strongCategories: data?.strongCategories || [],
        streakDays: data?.streakDays || 0
      };
    }
    
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracyPercentage: 0,
      weakCategories: [],
      strongCategories: [],
      streakDays: 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracyPercentage: 0,
      weakCategories: [],
      strongCategories: [],
      streakDays: 0
    };
  }
};

/**
 * Get system-wide statistics
 */
export const getSystemStats = async () => {
  try {
    // Use Firebase callable function
    const data = await callFunction('getSystemStats', {});
    
    return data || {
      totalUsers: 0,
      activeUsers: 0,
      questionsGenerated: 0,
      questionsAnswered: 0
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      questionsGenerated: 0,
      questionsAnswered: 0
    };
  }
};
