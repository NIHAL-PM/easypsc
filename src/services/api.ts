import { supabase } from '@/integrations/supabase/client';
import { ExamType, Question, QuestionDifficulty, User } from '@/types';

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
    
    // Then save to Supabase for persistence
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'set',
        key,
        value
      }
    });
    
    if (error) {
      console.error('Error saving API key to Supabase:', error);
      return false;
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
    
    // If not in localStorage, try to get from Supabase
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'get',
        key
      }
    });
    
    if (error) {
      console.error('Error fetching API key from Supabase:', error);
      return null;
    }
    
    // If key found in Supabase, save to localStorage for future use
    if (data?.value) {
      localStorage.setItem(key, data.value);
    }
    
    return data?.value || null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
};

export const generateQuestions = async (options: GenerateQuestionsOptions): Promise<Question[]> => {
  try {
    console.log('Generating questions with params:', options);
    
    const { data, error } = await supabase.functions.invoke('gemini-api', {
      body: {
        action: 'generate-questions',
        examType: options.examType,
        difficulty: options.difficulty,
        count: options.count,
        askedQuestionIds: options.askedQuestionIds || [],
        language: options.language || 'english'
      }
    });

    if (error) {
      console.error('Error generating questions:', error);
      return [];
    }

    console.log('Generated questions:', data.questions);
    return data.questions || [];
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    return [];
  }
};

/**
 * Generates chat responses using the Gemini API through Supabase Edge Function
 */
export const generateChat = async (userMessage: string): Promise<string | null> => {
  try {
    console.log('Generating chat response with Supabase Edge Function');
    
    const { data, error } = await supabase.functions.invoke('gemini-api', {
      body: {
        action: 'generate-chat',
        prompt: userMessage
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      return null;
    }
    
    // Return the chat response
    return data.response || null;
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
    const { data, error } = await supabase.functions.invoke('chat-room', {
      body: {
        action: 'get-messages',
        examType
      }
    });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    return data.messages || [];
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
    const { data, error } = await supabase.functions.invoke('chat-room', {
      body: {
        action: 'send-message',
        examType,
        userId,
        userName,
        message
      }
    });
    
    if (error) {
      console.error('Error sending chat message:', error);
      return null;
    }
    
    return data.message || null;
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
    const { data, error } = await supabase.functions.invoke('news-feed', {
      body: {
        action: 'get-news',
        category
      }
    });
    
    if (error) {
      console.error('Error fetching news:', error);
      return [];
    }
    
    return data.articles || [];
  } catch (error) {
    console.error('Error getting news articles:', error);
    return [];
  }
};

/**
 * Tracks user activity for analytics
 * Note: We're using direct API calls instead of edge functions for this
 */
export const trackUserActivity = async (
  userId: string,
  action: string,
  details: Record<string, any> = {}
) => {
  try {
    // Instead of trying to access user_activities directly, we'll use an edge function
    const { data, error } = await supabase.functions.invoke('track-activity', {
      body: {
        userId,
        action,
        details
      }
    });
      
    if (error) {
      console.error('Error tracking user activity:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error storing user activity:', error);
    return false;
  }
};

/**
 * Get user statistics from Supabase
 */
export const getUserStats = async (userId: string) => {
  try {
    // Get user progress from Supabase
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracyPercentage: 0,
        weakCategories: [],
        strongCategories: [],
        streakDays: 0
      };
    }
    
    return {
      totalQuestions: data.questions_attempted || 0,
      correctAnswers: data.questions_correct || 0,
      accuracyPercentage: data.questions_attempted > 0 
        ? (data.questions_correct / data.questions_attempted) * 100 
        : 0,
      weakCategories: [], // To be implemented with category tracking
      strongCategories: [], // To be implemented with category tracking
      streakDays: 0 // To be implemented with streak tracking
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
    // We'll use an edge function to get system stats to avoid TS errors 
    // when accessing tables that may not exist in the database schema
    const { data, error } = await supabase.functions.invoke('system-stats', {
      body: {}
    });
    
    if (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalUsers: 0,
        premiumUsers: 0,
        activeToday: 0,
        totalQuestionsAnswered: 0,
        totalQuestionsCorrect: 0,
        examTypeDistribution: {}
      };
    }
    
    return data || {
      totalUsers: 0,
      premiumUsers: 0, 
      activeToday: 0,
      totalQuestionsAnswered: 0,
      totalQuestionsCorrect: 0,
      examTypeDistribution: {}
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalUsers: 0,
      premiumUsers: 0,
      activeToday: 0,
      totalQuestionsAnswered: 0,
      totalQuestionsCorrect: 0,
      examTypeDistribution: {}
    };
  }
};
