
import { Question, ExamType, QuestionDifficulty, Language } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface GenerateQuestionsOptions {
  examType: ExamType;
  difficulty: QuestionDifficulty;
  count: number;
  askedQuestionIds?: string[];
  language?: Language;
}

// Hard-coded API key - in a real app, this would come from environment variables
const GEMINI_API_KEY = "AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik";

/**
 * Generates AI-powered questions using the Gemini 1.5 Flash API
 */
export const generateQuestions = async ({
  examType,
  difficulty,
  count,
  askedQuestionIds = [],
  language = 'English'
}: GenerateQuestionsOptions): Promise<Question[]> => {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured.');
      throw new Error('API key not configured');
    }
    
    // Prepare the prompt for Gemini with specific instruction not to repeat questions
    const prompt = `Generate ${count} multiple-choice questions for ${examType} exam preparation. 
    Difficulty level: ${difficulty}.
    Generate questions in ${language}.
    
    Critical requirements:
    1. Generate completely new and unique questions that have not been used before.
    2. Each question must have a different topic/concept to ensure variety.
    3. Ensure the questions are factually accurate and relevant to the ${examType} exam.
    4. All questions and options MUST be in ${language} language.
    
    Format each question with:
    1. Question text
    2. Four options (A, B, C, D)
    3. The correct option (0-indexed, 0 for A, 1 for B, etc.)
    4. A brief explanation of the correct answer
    5. Category/subject of the question
    
    Return as a JSON array of question objects with the following structure:
    {
      "id": "${uuidv4()}", // Use a unique ID for each question
      "text": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctOption": 0, // 0-indexed (0 for A, 1 for B, etc.)
      "explanation": "explanation of the correct answer",
      "category": "subject/category",
      "difficulty": "${difficulty}"
    }`;
    
    console.log('Calling Gemini API with prompt:', prompt);
    
    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gemini API response:', data);
    
    // Extract the content from the response
    const jsonContent = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON array from the response (handling markdown code blocks if present)
    const jsonRegex = /```(?:json)?([\s\S]*?)```|(\[[\s\S]*\])/;
    const match = jsonRegex.exec(jsonContent);
    
    if (!match) {
      throw new Error('Failed to parse JSON response from API');
    }
    
    const questionsJson = match[1]?.trim() || match[2]?.trim() || match[0]?.trim();
    let questions = JSON.parse(questionsJson) as Question[];
    
    // Ensure each question has a unique ID
    questions = questions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    }));
    
    // Filter out questions that have already been asked
    const filteredQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
    
    console.log(`Generated ${questions.length} questions, filtered to ${filteredQuestions.length} new questions`);
    
    return filteredQuestions.slice(0, count);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

/**
 * Generates chat responses using the Gemini API
 */
export const generateChat = async (
  userMessage: string,
  apiKey?: string
): Promise<string | null> => {
  try {
    const geminiApiKey = apiKey || GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.error('Gemini API key not configured for chat.');
      return null;
    }
    
    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert exam preparation assistant for competitive exams like UPSC, PSC, SSC, and Banking exams. 
                Provide helpful, accurate, and concise answers to the user's questions. Focus on being educational and helpful.
                
                User message: ${userMessage}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error in chat:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the content from the response
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return null;
  }
};

/**
 * Tracks user activity for analytics
 */
export const trackUserActivity = (
  userId: string,
  action: string,
  details: Record<string, any> = {}
) => {
  // Log the activity
  console.log('User activity:', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  
  // In a real app, we would send this data to a backend for storage
  try {
    // Store the activity in localStorage for persistence
    const activitiesKey = `user_activities_${userId}`;
    const existingActivities = JSON.parse(localStorage.getItem(activitiesKey) || '[]');
    
    existingActivities.push({
      action,
      details,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the last 1000 activities to prevent localStorage from getting too full
    const limitedActivities = existingActivities.slice(-1000);
    localStorage.setItem(activitiesKey, JSON.stringify(limitedActivities));
    
    return Promise.resolve(true);
  } catch (error) {
    console.error('Error storing user activity:', error);
    return Promise.resolve(false);
  }
};

// Helper function to get user statistics
export const getUserActivityStats = (userId: string) => {
  try {
    const activitiesKey = `user_activities_${userId}`;
    const activities = JSON.parse(localStorage.getItem(activitiesKey) || '[]');
    
    // Count various activities
    const questionsAnswered = activities.filter(a => a.action === 'answer_submitted').length;
    const questionsCorrect = activities.filter(a => a.action === 'answer_submitted' && a.details.isCorrect).length;
    
    // Get activities by exam type
    const examTypeActivities = activities.filter(a => a.details.examType);
    const examTypeCount = {};
    examTypeActivities.forEach(a => {
      const examType = a.details.examType;
      examTypeCount[examType] = (examTypeCount[examType] || 0) + 1;
    });
    
    return {
      totalActivities: activities.length,
      questionsAnswered,
      questionsCorrect,
      examTypeDistribution: examTypeCount
    };
  } catch (error) {
    console.error('Error getting user activity stats:', error);
    return {
      totalActivities: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      examTypeDistribution: {}
    };
  }
};

// Get system-wide statistics
export const getSystemStats = () => {
  try {
    // Get all keys in localStorage that start with 'user_activities_'
    const activityKeys = Object.keys(localStorage).filter(key => key.startsWith('user_activities_'));
    
    // Calculate total questions answered across all users
    let totalQuestionsAnswered = 0;
    let totalQuestionsCorrect = 0;
    
    activityKeys.forEach(key => {
      const activities = JSON.parse(localStorage.getItem(key) || '[]');
      totalQuestionsAnswered += activities.filter(a => a.action === 'answer_submitted').length;
      totalQuestionsCorrect += activities.filter(a => a.action === 'answer_submitted' && a.details.isCorrect).length;
    });
    
    // Get all users from localStorage
    const allUsers = JSON.parse(localStorage.getItem('ai-exam-prep-storage') || '{}')?.state?.allUsers || [];
    
    // Count users by exam type
    const examTypeCount = {};
    allUsers.forEach(user => {
      const examType = user.examType;
      examTypeCount[examType] = (examTypeCount[examType] || 0) + 1;
    });
    
    return {
      totalUsers: allUsers.length,
      premiumUsers: allUsers.filter(u => u.isPremium).length,
      activeToday: allUsers.filter(u => {
        const lastActive = new Date(u.lastActive);
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
      }).length,
      totalQuestionsAnswered,
      totalQuestionsCorrect,
      examTypeDistribution: examTypeCount
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
