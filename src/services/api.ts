
import { Question, ExamType, QuestionDifficulty } from '@/types';
import { getGeminiApiKey, isGeminiApiKeyConfigured } from '@/lib/env';

interface GenerateQuestionsOptions {
  examType: ExamType;
  difficulty: QuestionDifficulty;
  count: number;
  askedQuestionIds?: string[];
}

interface UserActivityTrackingOptions {
  action: string;
  details: Record<string, any>;
}

/**
 * Generates AI-powered questions using the Gemini 1.5 Flash API
 */
export const generateQuestions = async ({
  examType,
  difficulty,
  count,
  askedQuestionIds = []
}: GenerateQuestionsOptions): Promise<Question[]> => {
  try {
    const GEMINI_API_KEY = localStorage.getItem('GEMINI_API_KEY') || getGeminiApiKey();
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured.');
      // Return sample questions when API key is not available
      return getSampleQuestions(examType, difficulty, count);
    }
    
    // Prepare the prompt for Gemini
    const prompt = `Generate ${count} multiple-choice questions for ${examType} exam preparation. 
    Difficulty level: ${difficulty}.
    Generate questions in English.
    
    Important: Generate completely new and unique questions that have not been used before.
    
    Format each question with:
    1. Question text
    2. Four options (A, B, C, D)
    3. The correct option (0-indexed, 0 for A, 1 for B, etc.)
    4. A brief explanation of the correct answer
    5. Category/subject of the question
    
    Return as a JSON array of question objects with the following structure:
    {
      "id": "unique_id",
      "text": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctOption": 0, // 0-indexed (0 for A, 1 for B, etc.)
      "explanation": "explanation of the correct answer",
      "category": "subject/category",
      "difficulty": "${difficulty}"
    }`;
    
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
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the content from the response
    const jsonContent = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON array from the response (handling markdown code blocks if present)
    const jsonRegex = /```(?:json)?([\s\S]*?)```|(\[[\s\S]*\])/;
    const match = jsonRegex.exec(jsonContent);
    
    if (!match) {
      throw new Error('Failed to parse JSON response from API');
    }
    
    const questionsJson = match[1]?.trim() || match[2]?.trim() || match[0]?.trim();
    const questions = JSON.parse(questionsJson) as Question[];
    
    // Filter out questions that have already been asked
    const filteredQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
    
    return filteredQuestions.slice(0, count);
  } catch (error) {
    console.error('Error generating questions:', error);
    // Fallback to sample questions if API fails
    return getSampleQuestions(examType, difficulty, count);
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
    const GEMINI_API_KEY = apiKey || localStorage.getItem('GEMINI_API_KEY') || getGeminiApiKey();
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not configured for chat.');
      return null;
    }
    
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
                text: `You are an expert exam preparation assistant for competitive exams like UPSC, PSC, SSC, and Banking exams. 
                Provide helpful, accurate, and concise answers to the user's questions. Focus on being educational and helpful.
                
                User message: ${userMessage}`
              }
            ]
          }
        ]
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
  // In a real app, this would send data to a backend API
  // For now, we'll just log it
  console.log('User activity:', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  
  // Return a resolved promise to mimic an async call
  return Promise.resolve(true);
};

/**
 * Returns sample questions for testing when API is not available
 */
const getSampleQuestions = (
  examType: ExamType, 
  difficulty: QuestionDifficulty, 
  count: number
): Question[] => {
  const sampleQuestions: Record<ExamType, Question[]> = {
    'UPSC': [
      {
        id: 'upsc-sample-1',
        text: 'Which of the following is NOT a Fundamental Right guaranteed by the Indian Constitution?',
        options: [
          'Right to Equality',
          'Right to Property',
          'Right to Freedom',
          'Right to Constitutional Remedies'
        ],
        correctOption: 1,
        explanation: 'Right to Property was originally a Fundamental Right but was removed from the list by the 44th Amendment in 1978. It is now a legal right under Article 300A.',
        category: 'Indian Polity',
        difficulty: difficulty
      },
      {
        id: 'upsc-sample-2',
        text: 'The concept of "Judicial Review" in India has been borrowed from which country\'s constitution?',
        options: [
          'United Kingdom',
          'United States',
          'Canada',
          'Australia'
        ],
        correctOption: 1,
        explanation: 'The concept of Judicial Review has been borrowed from the United States. It empowers the judiciary to review the constitutionality of legislative and executive actions.',
        category: 'Indian Polity',
        difficulty: difficulty
      }
    ],
    'PSC': [
      {
        id: 'psc-sample-1',
        text: 'Which among the following rivers does NOT flow through Kerala?',
        options: [
          'Periyar',
          'Bharathapuzha',
          'Cauvery',
          'Pamba'
        ],
        correctOption: 2,
        explanation: 'Cauvery flows mainly through Karnataka and Tamil Nadu, not through Kerala. The other rivers mentioned - Periyar, Bharathapuzha, and Pamba - are major rivers in Kerala.',
        category: 'Kerala Geography',
        difficulty: difficulty
      },
      {
        id: 'psc-sample-2',
        text: 'Who was the first Chief Minister of Kerala?',
        options: [
          'E.M.S. Namboodiripad',
          'K. Karunakaran',
          'A.K. Antony',
          'C. Achutha Menon'
        ],
        correctOption: 0,
        explanation: 'E.M.S. Namboodiripad was the first Chief Minister of Kerala. He assumed office on April 5, 1957, after the first Kerala Legislative Assembly election.',
        category: 'Kerala History',
        difficulty: difficulty
      }
    ],
    'SSC': [
      {
        id: 'ssc-sample-1',
        text: 'If a person walks at 4 km/hr, he reaches his office 8 minutes early. If he walks at a speed of 3 km/hr, he reaches 7 minutes late. What is the exact distance of his office?',
        options: [
          '2 km',
          '3 km',
          '4 km',
          '5 km'
        ],
        correctOption: 0,
        explanation: 'Let the distance be d km and the exact time be t hr. Then, d/4 + (8/60) = t and d/3 - (7/60) = t. Solving these equations, we get d = 2 km.',
        category: 'Quantitative Aptitude',
        difficulty: difficulty
      },
      {
        id: 'ssc-sample-2',
        text: 'Which of the following is the antonym of ZENITH?',
        options: [
          'Apex',
          'Nadir',
          'Pinnacle',
          'Summit'
        ],
        correctOption: 1,
        explanation: 'Nadir means the lowest point and is the antonym of Zenith, which means the highest point or culmination.',
        category: 'English Language',
        difficulty: difficulty
      }
    ],
    'Banking': [
      {
        id: 'banking-sample-1',
        text: 'In which of the following types of banking, banks provide locker facilities, ATM services, and accept deposits?',
        options: [
          'Retail Banking',
          'Corporate Banking',
          'Investment Banking',
          'Universal Banking'
        ],
        correctOption: 0,
        explanation: 'Retail Banking involves providing services to individual customers including locker facilities, ATM services, and accepting deposits.',
        category: 'Banking Awareness',
        difficulty: difficulty
      },
      {
        id: 'banking-sample-2',
        text: 'Which committee is associated with the reforms in the Insurance sector in India?',
        options: [
          'Abid Hussain Committee',
          'Chakravarty Committee',
          'Malhotra Committee',
          'Narasimham Committee'
        ],
        correctOption: 2,
        explanation: 'The Malhotra Committee, headed by R.N. Malhotra, former RBI Governor, was formed to propose recommendations for reforms in the Insurance sector in India.',
        category: 'Financial Awareness',
        difficulty: difficulty
      }
    ]
  };
  
  // Return a subset of the sample questions
  return sampleQuestions[examType].slice(0, count);
};
