
import { Question, ExamType } from '@/types';
import { useAppStore } from '@/lib/store';
import { useQuestionStore } from './questionStore';

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
    // First check for custom questions in the store
    const questionStore = useQuestionStore.getState();
    const customQuestions = questionStore.getQuestionsByExamType(examType, difficulty)
      .filter(q => !askedQuestionIds.includes(q.id));
    
    // If we have enough custom questions, use those first
    if (customQuestions.length >= count) {
      console.log("Using custom questions from the store");
      return customQuestions.slice(0, count);
    }
    
    // If we have some custom questions but not enough, use what we have and get the rest from API
    if (customQuestions.length > 0 && customQuestions.length < count) {
      console.log(`Using ${customQuestions.length} custom questions, fetching ${count - customQuestions.length} more from API`);
      
      // Get the remaining questions from API or mock data
      const apiCount = count - customQuestions.length;
      const apiLanguage = examType === 'PSC' ? 'Malayalam' : 'English';
      
      const remainingQuestions = await fetchQuestionsFromAPI(
        examType,
        difficulty,
        apiCount,
        askedQuestionIds,
        apiLanguage
      );
      
      return [...customQuestions, ...remainingQuestions];
    }
    
    // If no custom questions available, get all from API or mock data
    console.log("No matching custom questions, fetching from API");
    const apiLanguage = examType === 'PSC' ? 'Malayalam' : 'English';
    
    return await fetchQuestionsFromAPI(
      examType,
      difficulty,
      count,
      askedQuestionIds,
      apiLanguage
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    // Return mock questions as fallback
    return getMockQuestions(examType, difficulty, count, askedQuestionIds);
  }
}

async function fetchQuestionsFromAPI(
  examType: ExamType,
  difficulty: string,
  count: number,
  askedQuestionIds: string[] = [],
  language: string = 'English'
): Promise<Question[]> {
  try {
    const languageInstruction = language === 'Malayalam' 
      ? 'Generate questions in Malayalam language for Kerala PSC exam.' 
      : 'Generate questions in English.';
      
    const prompt = `Generate ${count} multiple-choice questions for ${examType} exam preparation. 
    Difficulty level: ${difficulty}.
    ${languageInstruction}
    
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
  let allMockQuestions: Question[] = [];
  
  // General questions for all exam types
  const generalQuestions: Question[] = [
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
  
  // Malayalam questions for Kerala PSC
  const keralaPscQuestions: Question[] = [
    {
      id: "kpsc-mock-1",
      text: "കേരളത്തിന്റെ ആദ്യ മുഖ്യമന്ത്രി ആരായിരുന്നു?",
      options: [
        "ഇ.എം.എസ്. നമ്പൂതിരിപ്പാട്", 
        "പട്ടം താണു പിള്ള", 
        "സി. അച്യുത മേനോൻ", 
        "ആർ. ശങ്കർ"
      ],
      correctOption: 0,
      explanation: "ഇ.എം.എസ്. നമ്പൂതിരിപ്പാട് ആയിരുന്നു കേരളത്തിന്റെ ആദ്യ മുഖ്യമന്ത്രി. 1957 ഏപ്രിൽ 5 മുതൽ 1959 ജൂലൈ 31 വരെ അദ്ദേഹം മുഖ്യമന്ത്രിയായി സേവനമനുഷ്ഠിച്ചു.",
      category: "കേരള ചരിത്രം",
      difficulty: "easy",
    },
    {
      id: "kpsc-mock-2",
      text: "കേരള സംസ്ഥാനം രൂപീകരിച്ചത് എന്നാണ്?",
      options: [
        "1956 നവംബർ 1", 
        "1957 ജനുവരി 26", 
        "1950 ജനുവരി 26", 
        "1947 ഓഗസ്റ്റ് 15"
      ],
      correctOption: 0,
      explanation: "കേരള സംസ്ഥാനം 1956 നവംബർ 1-ന് രൂപീകരിച്ചു. ഇത് സംസ്ഥാന പുനഃസംഘടനാ നിയമത്തിന്റെ ഭാഗമായിരുന്നു.",
      category: "കേരള ചരിത്രം",
      difficulty: "easy",
    },
    {
      id: "kpsc-mock-3",
      text: "താഴെ പറയുന്നവയിൽ ഏതാണ് കേരളത്തിലെ ഏറ്റവും നീളം കൂടിയ നദി?",
      options: [
        "പമ്പ", 
        "പെരിയാർ", 
        "ഭാരതപ്പുഴ", 
        "കബനി"
      ],
      correctOption: 1,
      explanation: "പെരിയാർ ആണ് കേരളത്തിലെ ഏറ്റവും നീളം കൂടിയ നദി, ഏകദേശം 244 കിലോമീറ്റർ നീളമുണ്ട്.",
      category: "കേരള ഭൂമിശാസ്ത്രം",
      difficulty: "medium",
    },
  ];
  
  // Select appropriate questions based on exam type
  if (examType === 'PSC') {
    allMockQuestions = keralaPscQuestions;
  } else {
    allMockQuestions = generalQuestions;
  }
  
  // Filter by difficulty if specified
  if (difficulty) {
    allMockQuestions = allMockQuestions.filter(q => q.difficulty === difficulty);
  }
  
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
