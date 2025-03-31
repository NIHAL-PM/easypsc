
export type ExamType = 'UPSC' | 'PSC' | 'SSC' | 'Banking';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Malayalam';
export type Subject = 'Polity' | 'Economics' | 'Art & Culture' | 'History' | 'Geography' | 'Science' | 'Environment' | 'Current Affairs' | 'English Language' | 'General Knowledge';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'proficient' | 'expert';

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
  hearts: number;
  proficiencyLevel: ProficiencyLevel;
  subjectPerformance: Record<Subject, { correct: number; total: number; avgTime: number }>;
  questionHistory: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    timeSpent: number;
    date: number;
  }[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  category: string;
  difficulty: QuestionDifficulty;
  subject?: Subject;
  timeLimit?: number; // in seconds
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
  hearts: number;
  proficiencyLevel: ProficiencyLevel;
  examTypePerformance: Record<ExamType, { correct: number; total: number; accuracy: number }>;
  subjectPerformance: Record<Subject, { correct: number; total: number; avgTime: number }>;
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
  questionsWithTimer: boolean;
  currentQuestionStartTime: number | null;
  timeRemaining: number | null;
  mixedDifficultySettings: {
    easy: number;
    medium: number;
    hard: number;
  };
  selectedSubject: Subject | null;
}
