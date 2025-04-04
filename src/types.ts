
export type ExamType = 'UPSC' | 'PSC' | 'SSC' | 'Banking';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Malayalam';

export interface User {
  id: string;
  name: string;
  email: string;
  examType: ExamType;
  isPremium: boolean;
  monthlyQuestionsRemaining: number;
  questionsAnswered: number;
  questionsCorrect: number;
  currentStreak: number;
  lastActive: Date | null;
  lastQuestionTime: number | null;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  category: string;
  difficulty: QuestionDifficulty;
}

export interface CurrentAffairsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  source: string;
  question: Question;
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  weakCategories: string[];
  strongCategories: string[];
  streakDays: number;
}

export interface AppState {
  user: User | null;
  allUsers: User[];
  questions: Question[];
  currentQuestion: Question | null;
  selectedOption: number | null;
  isLoading: boolean;
  showExplanation: boolean;
  askedQuestionIds: string[];
}
