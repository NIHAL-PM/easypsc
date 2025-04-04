
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ExamType, Question, User, UserStats } from '@/types';
import { safeObjectEntries } from './utils';

// Define the app state interface
interface AppState {
  // User state
  user: User | null;
  authenticated: boolean;
  isLoading: boolean;
  
  // Question state
  currentQuestion: Question | null;
  questions: Question[];
  askedQuestionIds: string[];
  selectedOption: number | null;
  showExplanation: boolean;
  
  // Settings
  preferredLanguage: string;
  
  // Functions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSelectedOption: (option: number | null) => void;
  setShowExplanation: (show: boolean) => void;
  addAskedQuestionId: (id: string) => void;
  resetAskedQuestionIds: () => void;
  setLastQuestionTime: (time: number) => void;
  updateUserStats: (correct: boolean, category?: string) => void;
  setPreferredLanguage: (language: string) => void;
  getUserStats: () => UserStats;
}

// Create store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      authenticated: false,
      isLoading: true,
      
      // Question state
      currentQuestion: null,
      questions: [],
      askedQuestionIds: [],
      selectedOption: null,
      showExplanation: false,
      
      // Settings
      preferredLanguage: 'english',
      
      // Set the user
      setUser: (user) => set({ user }),
      
      // Set authentication status
      setAuthenticated: (authenticated) => set({ authenticated }),
      
      // Set loading state
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // Set questions array
      setQuestions: (questions) => {
        const newAskedIds = questions.map(q => q.id);
        set(state => ({
          questions,
          askedQuestionIds: [...state.askedQuestionIds, ...newAskedIds]
        }));
      },
      
      // Set current question
      setCurrentQuestion: (question) => set({ 
        currentQuestion: question,
        selectedOption: null,
        showExplanation: false 
      }),
      
      // Set selected option
      setSelectedOption: (option) => set({ selectedOption: option }),
      
      // Set show explanation
      setShowExplanation: (show) => set({ showExplanation: show }),
      
      // Add asked question ID
      addAskedQuestionId: (id) => set(state => ({
        askedQuestionIds: [...state.askedQuestionIds, id]
      })),
      
      // Reset asked question IDs
      resetAskedQuestionIds: () => set({ askedQuestionIds: [] }),
      
      // Set last question time
      setLastQuestionTime: (time) => set(state => {
        if (state.user) {
          return {
            user: {
              ...state.user,
              lastQuestionTime: time
            }
          };
        }
        return {};
      }),
      
      // Update user stats after answering a question
      updateUserStats: (correct, category) => set(state => {
        if (!state.user) return {};
        
        // Create updated user object with incremented stats
        const updatedUser = {
          ...state.user,
          questionsAnswered: state.user.questionsAnswered + 1,
          questionsCorrect: correct ? state.user.questionsCorrect + 1 : state.user.questionsCorrect,
          currentStreak: correct ? state.user.currentStreak + 1 : 0,
        };
        
        // Update category stats if provided
        if (category) {
          // Update weak categories
          const weakCategories = { ...state.user.weakCategories } || {};
          const strongCategories = { ...state.user.strongCategories } || {};
          
          if (correct) {
            // If correct, increment strong category count
            strongCategories[category] = (strongCategories[category] || 0) + 1;
          } else {
            // If incorrect, increment weak category count
            weakCategories[category] = (weakCategories[category] || 0) + 1;
          }
          
          updatedUser.weakCategories = weakCategories;
          updatedUser.strongCategories = strongCategories;
        }
        
        return { user: updatedUser };
      }),
      
      // Set preferred language
      setPreferredLanguage: (language) => set(state => {
        if (state.user) {
          return {
            preferredLanguage: language,
            user: {
              ...state.user,
              preferredLanguage: language
            }
          };
        }
        return { preferredLanguage: language };
      }),
      
      // Get user stats for profile display
      getUserStats: () => {
        const { user } = get();
        
        if (!user) {
          return {
            totalQuestions: 0,
            correctAnswers: 0,
            accuracyPercentage: 0,
            weakCategories: [],
            strongCategories: [],
            streakDays: 0
          };
        }
        
        // Use safeObjectEntries instead of direct Object.entries
        const weakCategories = safeObjectEntries(user.weakCategories || {})
          .sort((a, b) => a[1] - b[1])
          .slice(0, 3)
          .map(([name]) => name);
        
        // Use safeObjectEntries instead of direct Object.entries
        const strongCategories = safeObjectEntries(user.strongCategories || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);
        
        return {
          totalQuestions: user.questionsAnswered,
          correctAnswers: user.questionsCorrect,
          accuracyPercentage: user.questionsAnswered > 0 
            ? (user.questionsCorrect / user.questionsAnswered) * 100 
            : 0,
          weakCategories,
          strongCategories,
          streakDays: user.currentStreak
        };
      },
    }),
    {
      name: 'easy-psc-app-state',
      partialize: (state) => ({
        user: state.user,
        askedQuestionIds: state.askedQuestionIds,
        preferredLanguage: state.preferredLanguage
      }),
    }
  )
);
