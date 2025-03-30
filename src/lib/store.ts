
import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ExamType, Question, User, UserStats } from '@/types';

type AppStoreWithActions = AppState & {
  login: (name: string, email: string, examType: ExamType) => void;
  setUser: (user: User) => void;
  logout: () => void;
  upgradeUserToPremium: (userId: string) => void;
  addUser: (user: User) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question) => void;
  selectOption: (optionIndex: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  setIsLoading: (isLoading: boolean) => void;
  getUserStats: () => UserStats;
  changeExamType: (examType: ExamType) => void;
};

type AppPersistConfig = {
  name: string;
  version?: number;
};

const persistConfig: PersistOptions<AppStoreWithActions, AppStoreWithActions> = {
  name: 'ai-exam-prep-storage',
};

export const useAppStore = create<AppStoreWithActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      allUsers: [],
      questions: [],
      currentQuestion: null,
      selectedOption: null,
      isLoading: false,
      showExplanation: false,
      askedQuestionIds: [],

      // Actions
      login: (name, email, examType) => {
        const { allUsers } = get();
        
        // Check if user already exists
        const existingUser = allUsers.find(user => user.email === email);
        
        if (existingUser) {
          set({ user: existingUser });
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: uuidv4(),
          name,
          email,
          examType,
          isPremium: false,
          monthlyQuestionsRemaining: 10,  // Free tier limit
          questionsAnswered: 0,
          questionsCorrect: 0,
          currentStreak: 0,
          lastActive: new Date()
        };
        
        set(state => ({ 
          user: newUser,
          allUsers: [...state.allUsers, newUser]
        }));
      },
      
      setUser: (user) => set({ user }),
      
      logout: () => set({ user: null }),
      
      upgradeUserToPremium: (userId) => set(state => {
        // Update the user in allUsers
        const updatedUsers = state.allUsers.map(user => 
          user.id === userId 
            ? { ...user, isPremium: true, monthlyQuestionsRemaining: 999 } 
            : user
        );
        
        // Update current user if it's the same user
        const currentUser = state.user && state.user.id === userId
          ? { ...state.user, isPremium: true, monthlyQuestionsRemaining: 999 }
          : state.user;
        
        return { 
          allUsers: updatedUsers,
          user: currentUser
        };
      }),
      
      addUser: (user) => set(state => ({ 
        allUsers: [...state.allUsers, user] 
      })),
      
      setQuestions: (questions) => set({ 
        questions,
        askedQuestionIds: [...get().askedQuestionIds, ...questions.map(q => q.id)]
      }),
      
      setCurrentQuestion: (question) => set({ 
        currentQuestion: question,
        selectedOption: null,
        showExplanation: false
      }),
      
      selectOption: (optionIndex) => set({ 
        selectedOption: optionIndex 
      }),
      
      submitAnswer: () => {
        const { user, currentQuestion, selectedOption } = get();
        
        if (!user || !currentQuestion || selectedOption === null) return;
        
        const isCorrect = selectedOption === currentQuestion.correctOption;
        
        // Update user stats
        const updatedUser = {
          ...user,
          questionsAnswered: user.questionsAnswered + 1,
          questionsCorrect: isCorrect ? user.questionsCorrect + 1 : user.questionsCorrect,
          monthlyQuestionsRemaining: user.isPremium 
            ? user.monthlyQuestionsRemaining 
            : Math.max(0, user.monthlyQuestionsRemaining - 1),
          lastActive: new Date()
        };
        
        // Update allUsers as well
        const updatedAllUsers = get().allUsers.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers,
          showExplanation: true
        });
      },
      
      nextQuestion: () => {
        const { questions, currentQuestion } = get();
        
        if (!currentQuestion || questions.length <= 1) {
          set({ 
            currentQuestion: null,
            selectedOption: null,
            showExplanation: false
          });
          return;
        }
        
        // Find index of current question
        const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
        
        // Get next question or wrap around to the first one
        const nextIndex = (currentIndex + 1) % questions.length;
        const nextQuestion = questions[nextIndex];
        
        set({
          currentQuestion: nextQuestion,
          selectedOption: null,
          showExplanation: false
        });
      },
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
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
        
        return {
          totalQuestions: user.questionsAnswered,
          correctAnswers: user.questionsCorrect,
          accuracyPercentage: user.questionsAnswered > 0 
            ? (user.questionsCorrect / user.questionsAnswered) * 100 
            : 0,
          weakCategories: [], // To be implemented with category tracking
          strongCategories: [], // To be implemented with category tracking
          streakDays: user.currentStreak
        };
      },
      
      changeExamType: (examType) => {
        const { user, allUsers } = get();
        
        if (!user) return;
        
        const updatedUser = {
          ...user,
          examType
        };
        
        // Update allUsers as well
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers
        });
      }
    }),
    persistConfig
  )
);
