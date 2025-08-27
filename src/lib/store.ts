
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ChatMessage, ExamType, Language, Question, User, UserStats } from '@/types';

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
  setLastQuestionTime: (time: number) => void;
  sendChatMessage: (content: string) => void;
  getChatMessagesByExamType: (examType: ExamType) => ChatMessage[];
  setSelectedLanguage: (language: Language) => void;
  clearChatHistory: (examType?: ExamType) => void;
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
      chatMessages: [],
      selectedLanguage: 'English',

      // Actions
      login: (name, email, examType) => {
        const { allUsers } = get();
        
        // Check if user already exists
        const existingUser = allUsers.find(user => user.email === email);
        
        if (existingUser) {
          // Update last active timestamp and set selected language from user preferences
          const updatedUser = {
            ...existingUser,
            lastActive: new Date(),
            examType // Update exam type if different
          };
          
          set({ 
            user: updatedUser,
            allUsers: allUsers.map(u => u.id === updatedUser.id ? updatedUser : u),
            selectedLanguage: updatedUser.preferredLanguage || 'English'
          });
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: uuidv4(),
          name,
          email,
          examType,
          isPremium: false,
          monthlyQuestionsRemaining: 10,
          questionsAnswered: 0,
          questionsCorrect: 0,
          currentStreak: 0,
          lastActive: new Date(),
          lastQuestionTime: null,
          preferredLanguage: 'English'
        };
        
        set(state => ({ 
          user: newUser,
          allUsers: [...state.allUsers, newUser],
          selectedLanguage: newUser.preferredLanguage || 'English'
        }));
      },
      
      setUser: (user) => set({ user }),
      
      logout: () => set({ user: null }),
      
      upgradeUserToPremium: (userId) => set(state => {
        const updatedUsers = state.allUsers.map(user => 
          user.id === userId 
            ? { ...user, isPremium: true, monthlyQuestionsRemaining: 999 } 
            : user
        );
        
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
      
      setQuestions: (questions) => {
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
      
      selectOption: (optionIndex) => set({ 
        selectedOption: optionIndex 
      }),
      
      submitAnswer: () => {
        const { user, currentQuestion, selectedOption } = get();
        
        if (!user || !currentQuestion || selectedOption === null) return;
        
        const isCorrect = selectedOption === currentQuestion.correctOption;
        
        const updatedUser = {
          ...user,
          questionsAnswered: user.questionsAnswered + 1,
          questionsCorrect: isCorrect ? user.questionsCorrect + 1 : user.questionsCorrect,
          monthlyQuestionsRemaining: user.isPremium 
            ? user.monthlyQuestionsRemaining 
            : Math.max(0, user.monthlyQuestionsRemaining - 1),
          lastActive: new Date()
        };
        
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
        
        const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
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
          weakCategories: [],
          strongCategories: [],
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
        
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers
        });
      },
      
      setLastQuestionTime: (time) => {
        const { user, allUsers } = get();
        
        if (!user) return;
        
        const updatedUser = {
          ...user,
          lastQuestionTime: time
        };
        
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers
        });
      },

      sendChatMessage: (content) => {
        const { user, chatMessages } = get();
        
        if (!user || !content.trim()) return;

        const newMessage: ChatMessage = {
          id: uuidv4(),
          senderId: user.id,
          senderName: user.name,
          content: content.trim(),
          timestamp: new Date(),
          examType: user.examType
        };

        console.log(`💬 Sending chat message for ${user.examType}:`, content);

        set({ 
          chatMessages: [...chatMessages, newMessage]
        });
      },

      getChatMessagesByExamType: (examType) => {
        const { chatMessages } = get();
        const filtered = chatMessages.filter(message => message.examType === examType);
        console.log(`📨 Retrieved ${filtered.length} messages for ${examType}`);
        return filtered;
      },

      clearChatHistory: (examType) => {
        const { chatMessages } = get();
        
        if (examType) {
          // Clear messages for specific exam type
          const filteredMessages = chatMessages.filter(message => message.examType !== examType);
          set({ chatMessages: filteredMessages });
          console.log(`🗑️ Cleared chat history for ${examType}`);
        } else {
          // Clear all messages
          set({ chatMessages: [] });
          console.log('🗑️ Cleared all chat history');
        }
      },

      setSelectedLanguage: (language: Language) => {
        const { user, allUsers } = get();
        
        set({ selectedLanguage: language });
        
        if (user) {
          const updatedUser = {
            ...user,
            preferredLanguage: language
          };
          
          set({
            user: updatedUser,
            allUsers: allUsers.map(u => u.id === user.id ? updatedUser : u)
          });
        }
      },
    }),
    {
      name: 'ai-exam-prep-storage',
    }
  )
);
