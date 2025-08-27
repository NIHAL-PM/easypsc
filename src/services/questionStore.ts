
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, QuestionDifficulty, ExamType, Language } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface QuestionStore {
  customQuestions: Question[];
  addCustomQuestion: (question: Omit<Question, 'id'>) => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, question: Question) => void;
  deleteQuestion: (id: string) => void;
  getQuestionsByExamType: (examType: ExamType, language?: Language) => Question[];
}

export const useQuestionStore = create<QuestionStore>()(
  persist(
    (set, get) => ({
      customQuestions: [],
      
      addCustomQuestion: (questionData) => {
        const question: Question = {
          id: uuidv4(),
          ...questionData
        };
        
        set((state) => ({
          customQuestions: [...state.customQuestions, question]
        }));
      },
      
      addQuestion: (questionData) => {
        const question: Question = {
          id: uuidv4(),
          ...questionData
        };
        
        set((state) => ({
          customQuestions: [...state.customQuestions, question]
        }));
      },
      
      updateQuestion: (id: string, updatedQuestion: Question) => {
        set((state) => ({
          customQuestions: state.customQuestions.map(q => 
            q.id === id ? updatedQuestion : q
          )
        }));
      },
      
      deleteQuestion: (id: string) => {
        set((state) => ({
          customQuestions: state.customQuestions.filter(q => q.id !== id)
        }));
      },
      
      getQuestionsByExamType: (examType: ExamType, language?: Language) => {
        const { customQuestions } = get();
        return customQuestions.filter(q => {
          const matchesExamType = q.examType === examType;
          const matchesLanguage = !language || q.language === language;
          return matchesExamType && matchesLanguage;
        });
      }
    }),
    {
      name: 'question-store-storage'
    }
  )
);
