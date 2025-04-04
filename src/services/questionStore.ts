
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '@/types';

interface QuestionStoreState {
  customQuestions: Question[];
  addQuestion: (question: Question) => void;
  removeQuestion: (id: string) => void;
  getQuestion: (id: string) => Question | undefined;
}

export const useQuestionStore = create<QuestionStoreState>()(
  persist(
    (set, get) => ({
      customQuestions: [],
      
      addQuestion: (question) => set((state) => {
        // Only add if it doesn't already exist
        if (!state.customQuestions.some(q => q.id === question.id)) {
          return { customQuestions: [...state.customQuestions, question] };
        }
        return state;
      }),
      
      removeQuestion: (id) => set((state) => ({
        customQuestions: state.customQuestions.filter(q => q.id !== id)
      })),
      
      getQuestion: (id) => {
        return get().customQuestions.find(q => q.id === id);
      }
    }),
    {
      name: 'easy-psc-questions',
    }
  )
);
