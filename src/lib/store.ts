import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Question, QuestionAttempt, UserStats } from '@/types';

interface AppState {
  user: User | null;
  currentQuestion: Question | null;
  questionHistory: QuestionAttempt[];
  questions: Question[];
  isLoading: boolean;
  selectedOption: number | null;
  showExplanation: boolean;
  askedQuestionIds: string[]; // Track asked question IDs
  
  // User actions
  setUser: (user: User) => void;
  updateUserStats: (attempt: QuestionAttempt) => void;
  logout: () => void;
  
  // Question actions
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question) => void;
  selectOption: (optionIndex: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  toggleExplanation: () => void;
  
  // Loading state
  setIsLoading: (isLoading: boolean) => void;
  
  // Stats
  getUserStats: () => UserStats;
  
  // Admin actions
  allUsers: User[];
  addUser: (user: User) => void;
  upgradeUserToPremium: (userId: string) => void;
}

// Generate a unique user ID if not already present
const generateUserId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      currentQuestion: null,
      questionHistory: [],
      questions: [],
      isLoading: false,
      selectedOption: null,
      showExplanation: false,
      allUsers: [],
      askedQuestionIds: [], // Initialize empty array for tracking asked questions
      
      setUser: (user) => {
        // Keep the user's existing premium status and question limits
        const userWithId = {
          ...user,
          // Only set default questions if not already set
          monthlyQuestionsRemaining: user.monthlyQuestionsRemaining || 20,
        };
        
        set({ user: userWithId });
        
        // Also add this user to allUsers if not already there
        const { allUsers } = get();
        if (!allUsers.some(u => u.id === userWithId.id)) {
          set({ allUsers: [...allUsers, userWithId] });
        }
      },
      
      updateUserStats: (attempt) => {
        const { user, allUsers } = get();
        
        if (!user) return;
        
        let updatedQuestionsRemaining = user.monthlyQuestionsRemaining;
        
        // Only decrement questions for non-premium users
        if (!user.isPremium && updatedQuestionsRemaining > 0) {
          updatedQuestionsRemaining -= 1;
        }
        
        const updatedUser = {
          ...user,
          questionsAnswered: user.questionsAnswered + 1,
          questionsCorrect: attempt.isCorrect ? user.questionsCorrect + 1 : user.questionsCorrect,
          monthlyQuestionsRemaining: updatedQuestionsRemaining
        };
        
        // Update both the current user and in the all users array
        const updatedAllUsers = allUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers,
          questionHistory: [...get().questionHistory, attempt]
        });
      },
      
      logout: () => set({ 
        user: null,
        currentQuestion: null,
        questionHistory: [],
        questions: [],
        selectedOption: null,
        showExplanation: false,
        askedQuestionIds: [] // Clear asked questions when logging out
      }),
      
      setQuestions: (questions) => {
        // Update askedQuestionIds with the IDs of the new questions
        const newQuestionIds = questions.map(q => q.id);
        set(state => ({
          questions,
          askedQuestionIds: [...state.askedQuestionIds, ...newQuestionIds]
        }));
      },
      
      setCurrentQuestion: (question) => set({ 
        currentQuestion: question,
        selectedOption: null,
        showExplanation: false
      }),
      
      selectOption: (optionIndex) => set({ selectedOption: optionIndex }),
      
      submitAnswer: () => {
        const { currentQuestion, selectedOption, user } = get();
        
        if (!currentQuestion || selectedOption === null || !user) return;
        
        const isCorrect = selectedOption === currentQuestion.correctOption;
        
        const attempt: QuestionAttempt = {
          questionId: currentQuestion.id,
          selectedOption,
          isCorrect,
          timestamp: new Date()
        };
        
        get().updateUserStats(attempt);
        set({ showExplanation: true });
      },
      
      nextQuestion: () => {
        const { questions, currentQuestion } = get();
        
        if (!questions.length || !currentQuestion) return;
        
        const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
        const nextIndex = (currentIndex + 1) % questions.length;
        
        set({ 
          currentQuestion: questions[nextIndex],
          selectedOption: null,
          showExplanation: false
        });
      },
      
      resetQuiz: () => set({ 
        currentQuestion: get().questions[0] || null,
        selectedOption: null,
        showExplanation: false
      }),
      
      toggleExplanation: () => set({ showExplanation: !get().showExplanation }),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      getUserStats: () => {
        const { questionHistory } = get();
        
        const totalAnswered = questionHistory.length;
        const correctAnswers = questionHistory.filter(q => q.isCorrect).length;
        const incorrectAnswers = totalAnswered - correctAnswers;
        const accuracyPercentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
        
        // Calculate category breakdown
        const categoryBreakdown: UserStats['categoryBreakdown'] = {};
        
        // We would need to match question IDs with actual questions to get categories
        // This is simplified and would need to be expanded in a real application
        
        return {
          totalAnswered,
          correctAnswers,
          incorrectAnswers,
          accuracyPercentage,
          categoryBreakdown
        };
      },
      
      // Admin actions
      addUser: (user) => {
        const { allUsers } = get();
        set({ allUsers: [...allUsers, user] });
      },
      
      upgradeUserToPremium: (userId) => {
        const { allUsers, user } = get();
        
        const updatedAllUsers = allUsers.map(u => 
          u.id === userId 
            ? { ...u, isPremium: true, monthlyQuestionsRemaining: 999999 } 
            : u
        );
        
        // Also update the current user if they're the one being upgraded
        const updatedCurrentUser = user && user.id === userId 
          ? { ...user, isPremium: true, monthlyQuestionsRemaining: 999999 }
          : user;
        
        set({ 
          allUsers: updatedAllUsers,
          user: updatedCurrentUser
        });
      }
    }),
    {
      name: 'question-bank-storage', // name for localStorage
      partialize: (state) => ({
        user: state.user,
        questionHistory: state.questionHistory,
        allUsers: state.allUsers,
        askedQuestionIds: state.askedQuestionIds,
      }),
    }
  )
);
