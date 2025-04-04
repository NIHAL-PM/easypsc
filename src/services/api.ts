import { db, callFunction, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { ExamType, Question, QuestionDifficulty, User, UserStats } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/database.types';

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
    
    // Then save to database for persistence (if user is authenticated)
    if (auth.currentUser) {
      // Save to Supabase settings table
      const { error } = await supabase
        .from('settings')
        .upsert(
          { 
            key,
            value,
            user_id: auth.currentUser.uid,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key,user_id' }
        );
        
      if (error) throw error;
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
    
    // If not in localStorage and user is authenticated, try to get from database
    if (auth.currentUser) {
      // Try to get from Supabase
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .eq('user_id', auth.currentUser.uid)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching API key from Supabase:', error);
      } else if (data?.value) {
        localStorage.setItem(key, data.value);
        return data.value;
      }
    }
    
    // If we get here, we couldn't find a saved key
    // Check if we have the default Gemini API key
    if (key === 'GEMINI_API_KEY') {
      const defaultKey = "AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik";
      localStorage.setItem(key, defaultKey);
      return defaultKey;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
};

// Function to validate API key
export const validateApiKey = async (keyType: string, value: string): Promise<boolean> => {
  try {
    // For Gemini API key
    if (keyType === 'GEMINI_API_KEY') {
      // Since we have a valid key hardcoded, just check if it's that or starts with 'AIza'
      return value === "AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik" || value.startsWith('AIza');
    }
    
    // For News API key - simple format validation
    if (keyType === 'NEWS_API_KEY') {
      return value.length > 20;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

export const generateQuestions = async (options: GenerateQuestionsOptions): Promise<Question[]> => {
  try {
    console.log('Generating questions with params:', options);
    
    // Get the API key
    const apiKey = await getApiKey('GEMINI_API_KEY') || "AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik";
    
    console.log('Using API key:', apiKey ? 'Key is set' : 'No key available');

    // Basic implementation for question generation using Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate ${options.count} multiple-choice questions for ${options.examType} exam with ${options.difficulty} difficulty in ${options.language || 'English'}. Format as JSON array with fields: id (string), text (question text), options (array of 4 strings), correctOption (number 0-3), explanation (string), category (subject area), difficulty (string). Example: [{"id":"q1","text":"What is...?","options":["A","B","C","D"],"correctOption":2,"explanation":"C is correct because...","category":"History","difficulty":"medium"}]`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      })
    });

    if (!response.ok) {
      console.error('API request failed with status', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    let questionsText = '';
    if (data.candidates && data.candidates[0]?.content?.parts) {
      questionsText = data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response structure:', data);
      throw new Error('Unexpected API response structure');
    }

    // Extract JSON from the text response
    let jsonMatch = questionsText.match(/\[.*\]/s);
    if (!jsonMatch) {
      console.error('Failed to find JSON pattern in API response:', questionsText);
      throw new Error('Failed to parse questions from API response');
    }

    // Parse the JSON
    try {
      const questionsData = JSON.parse(jsonMatch[0]);
      console.log('Generated questions:', questionsData);
      return questionsData || [];
    } catch (e) {
      console.error('JSON parse error:', e);
      console.error('Failed JSON content:', jsonMatch[0]);
      throw new Error('Failed to parse question data');
    }
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
    
    // Get the API key
    const apiKey = await getApiKey('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Basic implementation for chat using Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an educational assistant helping with exam preparation. ${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    let responseText = '';
    if (data.candidates && data.candidates[0]?.content?.parts) {
      responseText = data.candidates[0].content.parts[0].text;
    }
    
    return responseText || null;
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
    const apiKey = await getApiKey('NEWS_API_KEY');
    if (!apiKey) {
      throw new Error('News API key not configured');
    }
    
    // Direct API call for simplicity - in production this would be a cloud function
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=in&category=${category}&apiKey=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.articles || [];
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
    // Get user count
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;
    
    // Get active users (active in last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const activeUsersQuery = query(
      collection(db, "users"),
      where("lastActive", ">=", oneDayAgo)
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.size;
    
    // Get questions data
    const questionsSnapshot = await getDocs(collection(db, "user_progress"));
    let questionsGenerated = 0;
    let questionsAnswered = 0;
    
    questionsSnapshot.forEach(doc => {
      const data = doc.data();
      questionsAnswered += data.questionsAttempted || 0;
    });
    
    // Estimate generated as 20% more than answered
    questionsGenerated = Math.round(questionsAnswered * 1.2);
    
    return {
      totalUsers,
      activeUsers,
      questionsGenerated,
      questionsAnswered
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
