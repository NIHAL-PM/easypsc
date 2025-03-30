
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '@/types';

interface QuestionStore {
  customQuestions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updatedQuestion: Question) => void;
  deleteQuestion: (id: string) => void;
  getQuestionById: (id: string) => Question | undefined;
}

export const useQuestionStore = create<QuestionStore>(persist((set, get) => ({
  customQuestions: [],

  addQuestion: (question) => {
    set((state) => ({
      customQuestions: [...state.customQuestions, question]
    }));
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
  }
}), {
  name: 'custom-questions-storage'
}));
