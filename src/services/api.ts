
import { Question, ExamType } from '@/types';
import { useAppStore } from '@/lib/store';

// Google Gemini API configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD4p5YZyQbQRDgu37WqIEl7QSXBn1O3p6s";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

interface GenerateQuestionsParams {
  examType: ExamType;
  difficulty: string;
  count: number;
  category?: string;
  askedQuestionIds?: string[]; // Added parameter to track already asked questions
}

export async function generateQuestions({
  examType,
  difficulty,
  count,
  category,
  askedQuestionIds = []
}: GenerateQuestionsParams): Promise<Question[]> {
  try {
    const prompt = `Generate ${count} multiple-choice questions for ${examType} exam preparation. 
    Difficulty level: ${difficulty}.
    ${category ? `Category: ${category}.` : ''}
    
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

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
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
      console.error(`API request failed with status: ${response.status}`);
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text from the response
    const text = data.candidates[0].content.parts[0].text;
    
    // Find the JSON part in the text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Fallback to mock data if no JSON found
      return getMockQuestions(examType, difficulty, count, askedQuestionIds);
    }
    
    try {
      const questionsJson = JSON.parse(jsonMatch[0]);
      
      // Ensure each question has an id and filter out any questions that have been asked before
      const newQuestions = questionsJson
        .map((q: any, index: number) => ({
          ...q,
          id: q.id || `q-${Date.now()}-${index}`,
        }))
        .filter((q: Question) => !askedQuestionIds.includes(q.id));
      
      // If we don't have enough new questions, generate more
      if (newQuestions.length < count) {
        console.log("Not enough unique questions, generating more...");
        const moreQuestions = await getMockQuestions(
          examType, 
          difficulty, 
          count - newQuestions.length, 
          [...askedQuestionIds, ...newQuestions.map(q => q.id)]
        );
        return [...newQuestions, ...moreQuestions];
      }
      
      return newQuestions;
    } catch (parseError) {
      console.error("Error parsing JSON from API response:", parseError);
      return getMockQuestions(examType, difficulty, count, askedQuestionIds);
    }
    
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return mock questions as fallback
    return getMockQuestions(examType, difficulty, count, askedQuestionIds);
  }
}

// Mock questions for fallback
function getMockQuestions(
  examType: ExamType, 
  difficulty: string, 
  count: number, 
  askedQuestionIds: string[] = []
): Question[] {
  const allMockQuestions: Question[] = [
    {
      id: "q1",
      text: "Which article of the Indian Constitution abolishes untouchability?",
      options: [
        "Article 14", 
        "Article 15", 
        "Article 17", 
        "Article 21"
      ],
      correctOption: 2,
      explanation: "Article 17 of the Indian Constitution abolishes the practice of untouchability in any form. It makes the enforcement of any disability arising out of untouchability a punishable offense.",
      category: "Indian Constitution",
      difficulty: "medium",
    },
    {
      id: "q2",
      text: "The concept of Welfare State is included in which part of the Indian Constitution?",
      options: [
        "Preamble", 
        "Fundamental Rights", 
        "Directive Principles of State Policy", 
        "Fundamental Duties"
      ],
      correctOption: 2,
      explanation: "The concept of a Welfare State is embodied in the Directive Principles of State Policy (Part IV, Articles 36-51) of the Indian Constitution, which set forth the humanitarian and socialist principles that the state should follow.",
      category: "Indian Constitution",
      difficulty: "medium",
    },
    {
      id: "q3",
      text: "Which of the following rivers does NOT originate in India?",
      options: [
        "Godavari", 
        "Brahmaputra", 
        "Mahanadi", 
        "Kaveri"
      ],
      correctOption: 1,
      explanation: "The Brahmaputra originates in the Mansarovar Lake region in Tibet (China) as the Yarlung Tsangpo River. It enters India through Arunachal Pradesh and then flows through Assam.",
      category: "Geography",
      difficulty: "medium",
    },
    {
      id: "q4",
      text: "Who among the following founded the 'Servants of India Society'?",
      options: [
        "Bal Gangadhar Tilak", 
        "Gopal Krishna Gokhale", 
        "Bipin Chandra Pal", 
        "Lala Lajpat Rai"
      ],
      correctOption: 1,
      explanation: "Gopal Krishna Gokhale founded the Servants of India Society in 1905 to promote education and social reform. It was the first secular organization in India to devote itself to the cause of the common people.",
      category: "Modern Indian History",
      difficulty: "medium",
    },
    {
      id: "q5",
      text: "Which of the following is NOT a member of the BRICS group?",
      options: [
        "Brazil", 
        "Russia", 
        "Indonesia", 
        "South Africa"
      ],
      correctOption: 2,
      explanation: "BRICS is an association of five major emerging economies: Brazil, Russia, India, China, and South Africa. Indonesia is not a member of BRICS; it's a part of other groupings like ASEAN and G20.",
      category: "International Relations",
      difficulty: "easy",
    }
  ];
  
  // Filter out questions that have already been asked
  const availableQuestions = allMockQuestions.filter(
    q => !askedQuestionIds.includes(q.id)
  );
  
  // If we need more questions than available, generate some with unique IDs
  if (availableQuestions.length < count) {
    const additionalQuestions: Question[] = [];
    
    for (let i = 0; i < count - availableQuestions.length; i++) {
      // Copy a question but give it a new ID
      const baseQuestion = allMockQuestions[i % allMockQuestions.length];
      additionalQuestions.push({
        ...baseQuestion,
        id: `q-${Date.now()}-${i}`,
        text: `${baseQuestion.text} (variant ${i+1})` // Slightly modify the question
      });
    }
    
    return [...availableQuestions, ...additionalQuestions].slice(0, count);
  }
  
  return availableQuestions.slice(0, count);
}

// User tracking functionality
export async function trackUserActivity(userId: string, action: string, metadata: Record<string, any>) {
  try {
    // In a real application, this would send data to your analytics backend
    console.log("User tracking:", { userId, action, metadata, timestamp: new Date() });
    
    // Mock successful tracking
    return { success: true };
  } catch (error) {
    console.error("Error tracking user activity:", error);
    return { success: false, error };
  }
}
