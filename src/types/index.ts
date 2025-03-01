
export interface User {
  id: string;
  name: string;
  email: string;
  examType: ExamType;
  questionsAnswered: number;
  questionsCorrect: number;
  isPremium: boolean;
  monthlyQuestionsRemaining: number;
}

export type ExamType = 'UPSC' | 'PSC' | 'SSC' | 'Banking';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionAttempt {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  timestamp: Date;
}

export interface UserStats {
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  categoryBreakdown: {
    [key: string]: {
      total: number;
      correct: number;
      accuracy: number;
    }
  }
}
