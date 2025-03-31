import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ExamType, Question, User, UserStats, Subject, ProficiencyLevel, QuestionDifficulty } from '@/types';

type AppStoreWithActions = AppState & {
  login: (name: string, email: string, examType: ExamType) => void;
  setUser: (user: User) => void;
  logout: () => void;
  upgradeUserToPremium: (userId: string) => void;
  addUser: (user: User) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question) => void;
  selectOption: (optionIndex: number) => void;
  submitAnswer: (timeSpent?: number) => void;
  nextQuestion: () => void;
  setIsLoading: (isLoading: boolean) => void;
  getUserStats: () => UserStats;
  changeExamType: (examType: ExamType) => void;
  setLastQuestionTime: (time: number) => void;
  toggleQuestionsWithTimer: () => void;
  setQuestionStartTime: (time: number) => void;
  updateTimeRemaining: (time: number | null) => void;
  setMixedDifficultySettings: (settings: { easy: number; medium: number; hard: number }) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  addHeart: () => void;
  updateProficiencyLevel: (userId: string) => void;
};

// Helper function to determine proficiency level based on performance
const calculateProficiencyLevel = (user: User): ProficiencyLevel => {
  const accuracy = user.questionsAnswered > 0 
    ? (user.questionsCorrect / user.questionsAnswered) * 100 
    : 0;
  
  if (user.questionsAnswered < 10) {
    return 'beginner';
  } else if (accuracy < 40) {
    return 'beginner';
  } else if (accuracy < 60) {
    return 'intermediate';
  } else if (accuracy < 80) {
    return 'proficient';
  } else {
    return 'expert';
  }
};

// Helper to get default time limit based on difficulty
const getDefaultTimeLimit = (difficulty: QuestionDifficulty): number => {
  switch (difficulty) {
    case 'easy': return 60; // 1 minute
    case 'medium': return 90; // 1.5 minutes
    case 'hard': return 120; // 2 minutes
    default: return 90;
  }
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
      questionsWithTimer: true, // Enable timer by default
      currentQuestionStartTime: null,
      timeRemaining: null,
      mixedDifficultySettings: {
        easy: 2,
        medium: 5,
        hard: 3
      },
      selectedSubject: null,

      // Actions
      login: (name, email, examType) => {
        const { allUsers } = get();
        
        // Check if user already exists
        const existingUser = allUsers.find(user => user.email === email);
        
        if (existingUser) {
          // Update last active timestamp
          const updatedUser = {
            ...existingUser,
            lastActive: new Date()
          };
          
          set({ 
            user: updatedUser,
            allUsers: allUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
          });
          return;
        }
        
        // Initialize empty subject performance record
        const subjectPerformance: Record<Subject, { correct: number; total: number; avgTime: number }> = {
          'Polity': { correct: 0, total: 0, avgTime: 0 },
          'Economics': { correct: 0, total: 0, avgTime: 0 },
          'Art & Culture': { correct: 0, total: 0, avgTime: 0 },
          'History': { correct: 0, total: 0, avgTime: 0 },
          'Geography': { correct: 0, total: 0, avgTime: 0 },
          'Science': { correct: 0, total: 0, avgTime: 0 },
          'Environment': { correct: 0, total: 0, avgTime: 0 },
          'Current Affairs': { correct: 0, total: 0, avgTime: 0 },
          'English Language': { correct: 0, total: 0, avgTime: 0 },
          'General Knowledge': { correct: 0, total: 0, avgTime: 0 }
        };
        
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
          lastActive: new Date(),
          lastQuestionTime: null,
          hearts: 0,
          proficiencyLevel: 'beginner',
          subjectPerformance,
          questionHistory: []
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
      
      setQuestions: (questions) => {
        const newQuestionIds = questions.map(q => q.id);
        
        // Add time limits to questions that don't have them
        const questionsWithTimeLimit = questions.map(q => ({
          ...q,
          timeLimit: q.timeLimit || getDefaultTimeLimit(q.difficulty),
          // Set a default subject if not present
          subject: q.subject || 'General Knowledge' as Subject
        }));
        
        set(state => ({ 
          questions: questionsWithTimeLimit,
          // Add new question IDs to the list of asked questions
          askedQuestionIds: [...state.askedQuestionIds, ...newQuestionIds]
        }));
      },
      
      setCurrentQuestion: (question) => set({ 
        currentQuestion: {
          ...question,
          timeLimit: question.timeLimit || getDefaultTimeLimit(question.difficulty),
          subject: question.subject || 'General Knowledge' as Subject
        },
        selectedOption: null,
        showExplanation: false,
        currentQuestionStartTime: Date.now()
      }),
      
      selectOption: (optionIndex) => set({ 
        selectedOption: optionIndex 
      }),
      
      submitAnswer: (timeSpent = 0) => {
        const { user, currentQuestion, selectedOption } = get();
        
        if (!user || !currentQuestion || selectedOption === null) return;
        
        const isCorrect = selectedOption === currentQuestion.correctOption;
        
        // Create a question history entry
        const historyEntry = {
          questionId: currentQuestion.id,
          selectedOption,
          isCorrect,
          timeSpent,
          date: Date.now()
        };
        
        // Update subject performance
        const subject = currentQuestion.subject || 'General Knowledge';
        const currentSubjectStats = user.subjectPerformance[subject] || { correct: 0, total: 0, avgTime: 0 };
        const updatedSubjectStats = {
          correct: isCorrect ? currentSubjectStats.correct + 1 : currentSubjectStats.correct,
          total: currentSubjectStats.total + 1,
          avgTime: currentSubjectStats.total === 0 
            ? timeSpent
            : Math.round((currentSubjectStats.avgTime * currentSubjectStats.total + timeSpent) / (currentSubjectStats.total + 1))
        };
        
        // Update user stats
        const updatedUser = {
          ...user,
          questionsAnswered: user.questionsAnswered + 1,
          questionsCorrect: isCorrect ? user.questionsCorrect + 1 : user.questionsCorrect,
          monthlyQuestionsRemaining: user.isPremium 
            ? user.monthlyQuestionsRemaining 
            : Math.max(0, user.monthlyQuestionsRemaining - 1),
          lastActive: new Date(),
          subjectPerformance: {
            ...user.subjectPerformance,
            [subject]: updatedSubjectStats
          },
          questionHistory: [historyEntry, ...user.questionHistory || []]
        };
        
        // Update proficiency level based on performance
        const proficiencyLevel = calculateProficiencyLevel(updatedUser);
        
        // Update allUsers as well
        const updatedAllUsers = get().allUsers.map(u => 
          u.id === user.id ? { ...updatedUser, proficiencyLevel } : u
        );
        
        set({ 
          user: { ...updatedUser, proficiencyLevel },
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
            showExplanation: false,
            currentQuestionStartTime: null,
            timeRemaining: null
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
          showExplanation: false,
          currentQuestionStartTime: Date.now(),
          timeRemaining: null
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
            streakDays: 0,
            hearts: 0,
            proficiencyLevel: 'beginner' as ProficiencyLevel,
            examTypePerformance: {
              'UPSC': { correct: 0, total: 0, accuracy: 0 },
              'PSC': { correct: 0, total: 0, accuracy: 0 },
              'SSC': { correct: 0, total: 0, accuracy: 0 },
              'Banking': { correct: 0, total: 0, accuracy: 0 }
            },
            subjectPerformance: {
              'Polity': { correct: 0, total: 0, avgTime: 0 },
              'Economics': { correct: 0, total: 0, avgTime: 0 },
              'Art & Culture': { correct: 0, total: 0, avgTime: 0 },
              'History': { correct: 0, total: 0, avgTime: 0 },
              'Geography': { correct: 0, total: 0, avgTime: 0 },
              'Science': { correct: 0, total: 0, avgTime: 0 },
              'Environment': { correct: 0, total: 0, avgTime: 0 },
              'Current Affairs': { correct: 0, total: 0, avgTime: 0 },
              'English Language': { correct: 0, total: 0, avgTime: 0 },
              'General Knowledge': { correct: 0, total: 0, avgTime: 0 }
            }
          };
        }
        
        // Calculate weak and strong categories
        const subjectEntries = Object.entries(user.subjectPerformance);
        const activeSubjects = subjectEntries.filter(([_, stats]) => stats.total > 0);
        
        // Sort by accuracy
        const sortedSubjects = [...activeSubjects].sort((a, b) => {
          const accuracyA = a[1].correct / a[1].total;
          const accuracyB = b[1].correct / b[1].total;
          return accuracyA - accuracyB; // Ascending for weak categories
        });
        
        const weakCategories = sortedSubjects.slice(0, 3).map(([subject]) => subject);
        const strongCategories = [...sortedSubjects].sort((a, b) => {
          const accuracyA = a[1].correct / a[1].total;
          const accuracyB = b[1].correct / b[1].total;
          return accuracyB - accuracyA; // Descending for strong categories
        }).slice(0, 3).map(([subject]) => subject);
        
        // Create exam type performance stats
        const examTypePerformance: Record<ExamType, { correct: number; total: number; accuracy: number }> = {
          'UPSC': { correct: 0, total: 0, accuracy: 0 },
          'PSC': { correct: 0, total: 0, accuracy: 0 },
          'SSC': { correct: 0, total: 0, accuracy: 0 },
          'Banking': { correct: 0, total: 0, accuracy: 0 }
        };
        
        // For now, we'll just use the current exam type for stats
        examTypePerformance[user.examType] = {
          correct: user.questionsCorrect,
          total: user.questionsAnswered,
          accuracy: user.questionsAnswered > 0 
            ? (user.questionsCorrect / user.questionsAnswered) * 100 
            : 0
        };
        
        return {
          totalQuestions: user.questionsAnswered,
          correctAnswers: user.questionsCorrect,
          accuracyPercentage: user.questionsAnswered > 0 
            ? (user.questionsCorrect / user.questionsAnswered) * 100 
            : 0,
          weakCategories,
          strongCategories,
          streakDays: user.currentStreak,
          hearts: user.hearts,
          proficiencyLevel: user.proficiencyLevel,
          examTypePerformance,
          subjectPerformance: user.subjectPerformance
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
      },
      
      setLastQuestionTime: (time) => {
        const { user, allUsers } = get();
        
        if (!user) return;
        
        const updatedUser = {
          ...user,
          lastQuestionTime: time
        };
        
        // Update allUsers as well
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers
        });
      },
      
      toggleQuestionsWithTimer: () => {
        set(state => ({ 
          questionsWithTimer: !state.questionsWithTimer 
        }));
      },
      
      setQuestionStartTime: (time) => {
        set({ currentQuestionStartTime: time });
      },
      
      updateTimeRemaining: (time) => {
        set({ timeRemaining: time });
      },
      
      setMixedDifficultySettings: (settings) => {
        set({ mixedDifficultySettings: settings });
      },
      
      setSelectedSubject: (subject) => {
        set({ selectedSubject: subject });
      },
      
      addHeart: () => {
        const { user, allUsers } = get();
        
        if (!user) return;
        
        const updatedUser = {
          ...user,
          hearts: user.hearts + 1
        };
        
        // Update allUsers as well
        const updatedAllUsers = allUsers.map(u => 
          u.id === user.id ? updatedUser : u
        );
        
        set({ 
          user: updatedUser,
          allUsers: updatedAllUsers
        });
      },
      
      updateProficiencyLevel: (userId) => {
        const { allUsers } = get();
        const user = allUsers.find(u => u.id === userId);
        
        if (!user) return;
        
        const proficiencyLevel = calculateProficiencyLevel(user);
        
        // Update user proficiency
        const updatedUser = {
          ...user,
          proficiencyLevel
        };
        
        // Update allUsers
        const updatedAllUsers = allUsers.map(u => 
          u.id === userId ? updatedUser : u
        );
        
        set({ 
          allUsers: updatedAllUsers,
          user: get().user?.id === userId ? updatedUser : get().user
        });
      }
    }),
    {
      name: 'ai-exam-prep-storage',
    }
  )
);
