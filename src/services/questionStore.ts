
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, QuestionDifficulty, ExamType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface QuestionStore {
  customQuestions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updatedQuestion: Question) => void;
  deleteQuestion: (id: string) => void;
  getQuestionById: (id: string) => Question | undefined;
  getAllQuestions: () => Question[];
  getQuestionsByExamType: (examType: ExamType) => Question[];
  getQuestionsByDifficulty: (difficulty: QuestionDifficulty) => Question[];
  addCustomQuestion: (question: Omit<Question, 'id'>) => void;
  clearAllQuestions: () => void;
}

export const useQuestionStore = create<QuestionStore>()(
  persist(
    (set, get) => ({
      customQuestions: [],

      addQuestion: (question) => {
        // Check if question already exists to avoid duplicates
        const exists = get().customQuestions.some(q => q.id === question.id);
        if (!exists) {
          set((state) => ({
            customQuestions: [...state.customQuestions, question]
          }));
        }
      },

      updateQuestion: (id, updatedQuestion) => {
        set((state) => ({
          customQuestions: state.customQuestions.map((question) =>
            question.id === id ? updatedQuestion : question
          )
        }));
      },

      deleteQuestion: (id) => {
        set((state) => ({
          customQuestions: state.customQuestions.filter((question) => question.id !== id)
        }));
      },

      getQuestionById: (id) => {
        return get().customQuestions.find((question) => question.id === id);
      },
      
      getAllQuestions: () => {
        return get().customQuestions;
      },
      
      getQuestionsByExamType: (examType) => {
        // In our simple implementation, we don't directly store examType with questions
        // This is just a placeholder for future implementation
        return get().customQuestions;
      },
      
      getQuestionsByDifficulty: (difficulty) => {
        return get().customQuestions.filter(
          (question) => question.difficulty === difficulty
        );
      },
      
      addCustomQuestion: (questionData) => {
        const newQuestion: Question = {
          ...questionData,
          id: uuidv4()
        };
        
        set((state) => ({
          customQuestions: [...state.customQuestions, newQuestion]
        }));
      },
      
      clearAllQuestions: () => {
        set({ customQuestions: [] });
      }
    }),
    {
      name: 'custom-questions-storage',
    }
  )
);
