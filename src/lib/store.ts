
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Question, AppState, ChatMessage, ExamType, Language, UserStats } from '@/types';
import { pusherService } from '@/services/pusherService';

interface Actions {
  setUser: (user: User | null) => void;
  login: (name: string, email: string, examType: ExamType) => void;
  setAllUsers: (users: User[]) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSelectedOption: (option: number | null) => void;
  selectOption: (option: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setShowExplanation: (showExplanation: boolean) => void;
  addAskedQuestionId: (questionId: string) => void;
  clearAskedQuestionIds: () => void;
  addChatMessage: (message: ChatMessage) => void;
  sendChatMessage: (content: string) => void;
  getChatMessagesByExamType: (examType: ExamType) => ChatMessage[];
  setSelectedLanguage: (language: Language) => void;
  getUserStats: () => UserStats;
  changeExamType: (examType: ExamType) => void;
  upgradeUserToPremium: () => void;
  setLastQuestionTime: () => void;
}

const initialState: Omit<AppState, 'user' | 'allUsers'> = {
  questions: [],
  currentQuestion: null,
  selectedOption: null,
  isLoading: false,
  showExplanation: false,
  askedQuestionIds: [],
  chatMessages: [],
  selectedLanguage: 'English',
};

export const useAppStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
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
      
      setUser: (user) => set({ user }),
      
      login: (name: string, email: string, examType: ExamType) => {
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
        
        set({ user: newUser });
        
        // Subscribe to Pusher channel
        if (newUser) {
          pusherService.subscribeToExamChannel(newUser.examType, (pusherMessage) => {
            const message: ChatMessage = {
              id: pusherMessage.id,
              senderId: pusherMessage.senderId,
              senderName: pusherMessage.senderName,
              content: pusherMessage.content,
              timestamp: new Date(pusherMessage.timestamp),
              examType: pusherMessage.examType as ExamType,
            };
            
            set((state) => ({
              chatMessages: [...state.chatMessages, message]
            }));
          });
        }
      },
      
      setAllUsers: (users) => set({ allUsers: users }),
      setQuestions: (questions) => set({ questions }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      setSelectedOption: (option) => set({ selectedOption: option }),
      
      selectOption: (option: number) => set({ selectedOption: option }),
      
      submitAnswer: () => {
        const { user, currentQuestion, selectedOption } = get();
        if (!user || !currentQuestion || selectedOption === null) return;
        
        const isCorrect = selectedOption === currentQuestion.correctOption;
        
        set((state) => ({
          user: state.user ? {
            ...state.user,
            questionsAnswered: state.user.questionsAnswered + 1,
            questionsCorrect: isCorrect ? state.user.questionsCorrect + 1 : state.user.questionsCorrect,
            monthlyQuestionsRemaining: Math.max(0, state.user.monthlyQuestionsRemaining - 1),
            lastActive: new Date(),
            lastQuestionTime: Date.now()
          } : null,
          showExplanation: true
        }));
      },
      
      nextQuestion: () => {
        set({ 
          currentQuestion: null, 
          selectedOption: null, 
          showExplanation: false 
        });
      },
      
      setIsLoading: (isLoading) => set({ isLoading }),
      setShowExplanation: (showExplanation) => set({ showExplanation }),
      addAskedQuestionId: (questionId) => set((state) => ({ askedQuestionIds: [...state.askedQuestionIds, questionId] })),
      clearAskedQuestionIds: () => set({ askedQuestionIds: [] }),
      addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      
      sendChatMessage: (content: string) => {
        const { user } = get();
        if (!user) return;
        
        const message: ChatMessage = {
          id: uuidv4(),
          senderId: user.id,
          senderName: user.name,
          content,
          timestamp: new Date(),
          examType: user.examType,
        };
        
        set((state) => ({
          chatMessages: [...state.chatMessages, message]
        }));
        
        // Send via Pusher for real-time updates
        pusherService.sendMessage(user.examType, {
          id: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          timestamp: message.timestamp,
          examType: message.examType
        });
      },
      
      getChatMessagesByExamType: (examType: ExamType) => {
        const { chatMessages } = get();
        return chatMessages.filter(msg => msg.examType === examType);
      },
      
      setSelectedLanguage: (language) => {
        set({ selectedLanguage: language });
      },
      
      getUserStats: (): UserStats => {
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
            ? Math.round((user.questionsCorrect / user.questionsAnswered) * 100) 
            : 0,
          weakCategories: [],
          strongCategories: [],
          streakDays: user.currentStreak
        };
      },
      
      changeExamType: (examType: ExamType) => {
        const { user } = get();
        if (!user) return;
        
        // Unsubscribe from old channel
        pusherService.unsubscribeFromChannel(user.examType);
        
        set((state) => ({
          user: state.user ? { ...state.user, examType } : null
        }));
        
        // Subscribe to new channel
        pusherService.subscribeToExamChannel(examType, (pusherMessage) => {
          const message: ChatMessage = {
            id: pusherMessage.id,
            senderId: pusherMessage.senderId,
            senderName: pusherMessage.senderName,
            content: pusherMessage.content,
            timestamp: new Date(pusherMessage.timestamp),
            examType: pusherMessage.examType as ExamType,
          };
          
          set((state) => ({
            chatMessages: [...state.chatMessages, message]
          }));
        });
      },
      
      upgradeUserToPremium: () => {
        set((state) => ({
          user: state.user ? { ...state.user, isPremium: true } : null
        }));
      },
      
      setLastQuestionTime: () => {
        set((state) => ({
          user: state.user ? { ...state.user, lastQuestionTime: Date.now() } : null
        }));
      }
    }),
    {
      name: 'ai-exam-prep-storage',
      partialize: (state) => ({
        user: state.user,
        allUsers: state.allUsers,
        questions: state.questions,
        askedQuestionIds: state.askedQuestionIds,
        chatMessages: state.chatMessages,
        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
);
