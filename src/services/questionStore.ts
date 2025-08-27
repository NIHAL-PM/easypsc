import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Question, ExamType, Language } from '@/types';

interface QuestionStore {
  customQuestions: Question[];
  addCustomQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getQuestionsByExamTypeAndLanguage: (examType: ExamType, language: Language) => Question[];
  clearQuestions: () => void;
}

export const useQuestionStore = create<QuestionStore>()(
  persist(
    (set, get) => ({
      customQuestions: [
        // Sample questions for each exam type and language
        {
          id: '1',
          text: 'Who is known as the Father of the Nation in India?',
          options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Dr. APJ Abdul Kalam'],
          correctOption: 0,
          explanation: 'Mahatma Gandhi is widely regarded as the Father of the Nation in India for his role in the independence movement.',
          category: 'History',
          difficulty: 'easy' as const,
          examType: 'UPSC' as ExamType,
          language: 'English' as Language
        },
        {
          id: '2',
          text: 'भारत के राष्ट्रपिता कौन हैं?',
          options: ['महात्मा गांधी', 'जवाहरलाल नेहरू', 'सरदार पटेल', 'डॉ. एपीजे अब्दुल कलाम'],
          correctOption: 0,
          explanation: 'महात्मा गांधी को भारत के राष्ट्रपिता के रूप में जाना जाता है।',
          category: 'History',
          difficulty: 'easy' as const,
          examType: 'UPSC' as ExamType,
          language: 'Hindi' as Language
        },
        {
          id: '3',
          text: 'What is the largest organ in the human body?',
          options: ['Heart', 'Liver', 'Brain', 'Skin'],
          correctOption: 3,
          explanation: 'The skin is the largest organ in the human body by surface area.',
          category: 'Science',
          difficulty: 'medium' as const,
          examType: 'SSC' as ExamType,
          language: 'English' as Language
        },
        {
          id: '4',
          text: 'Which bank is known as the Banker\'s Bank in India?',
          options: ['State Bank of India', 'Reserve Bank of India', 'ICICI Bank', 'HDFC Bank'],
          correctOption: 1,
          explanation: 'The Reserve Bank of India (RBI) is known as the Banker\'s Bank as it regulates all other banks.',
          category: 'Economics',
          difficulty: 'medium' as const,
          examType: 'Banking' as ExamType,
          language: 'English' as Language
        }
      ],
      
      addCustomQuestion: (question) => {
        const newQuestion: Question = {
          ...question,
          id: uuidv4(),
        };
        
        set((state) => ({
          customQuestions: [...state.customQuestions, newQuestion],
        }));
      },
      
      addQuestion: (question) => {
        const newQuestion: Question = {
          ...question,
          id: uuidv4(),
        };
        
        set((state) => ({
          customQuestions: [...state.customQuestions, newQuestion],
        }));
      },
      
      updateQuestion: (id, updates) => {
        set((state) => ({
          customQuestions: state.customQuestions.map((question) =>
            question.id === id ? { ...question, ...updates } : question
          ),
        }));
      },
      
      deleteQuestion: (id) => {
        set((state) => ({
          customQuestions: state.customQuestions.filter((question) => question.id !== id),
        }));
      },
      
      getQuestionsByExamTypeAndLanguage: (examType, language) => {
        const { customQuestions } = get();
        return customQuestions.filter(
          (question) => question.examType === examType && question.language === language
        );
      },
      
      clearQuestions: () => {
        set({ customQuestions: [] });
      },
    }),
    {
      name: 'question-store',
    }
  )
);
