import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Question, AppState, ChatMessage, ExamType, Language } from '@/types';
import { pusherService } from '@/services/pusherService';

interface Actions {
  setUser: (user: User | null) => void;
  setAllUsers: (users: User[]) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSelectedOption: (option: number | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setShowExplanation: (showExplanation: boolean) => void;
  addAskedQuestionId: (questionId: string) => void;
  clearAskedQuestionIds: () => void;
  addChatMessage: (message: ChatMessage) => void;
  sendChatMessage: (content: string) => void;
  getChatMessagesByExamType: (examType: ExamType) => ChatMessage[];
  setSelectedLanguage: (language: Language) => void;
}

const initialState: Omit<AppState, 'user' | 'allUsers' | 'chatMessages'> = {
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
      setAllUsers: (users) => set({ allUsers: users }),
      setQuestions: (questions) => set({ questions }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      setSelectedOption: (option) => set({ selectedOption: option }),
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
      
      // Subscribe to Pusher when user changes
      setUser: (user: User | null) => {
        const currentUser = get().user;
        
        // Unsubscribe from previous channel if user changes
        if (currentUser && currentUser.examType !== user?.examType) {
          pusherService.unsubscribeFromChannel(currentUser.examType);
        }
        
        set({ user });
        
        // Subscribe to new channel
        if (user) {
          pusherService.subscribeToExamChannel(user.examType, (pusherMessage) => {
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
      
      getChatMessagesByExamType: (examType: ExamType) => {
        const { chatMessages } = get();
        return chatMessages.filter(msg => msg.examType === examType);
      },
      
      setSelectedLanguage: (language) => {
        set({ selectedLanguage: language });
      },
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
