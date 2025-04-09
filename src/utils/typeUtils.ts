
import { QuestionDifficulty } from "@/types";

/**
 * Safely converts a string to a QuestionDifficulty type
 * @param value String value to convert
 * @returns Valid QuestionDifficulty or 'medium' as default
 */
export const toQuestionDifficulty = (value: string): QuestionDifficulty => {
  const validDifficulties: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
  return validDifficulties.includes(value as QuestionDifficulty) 
    ? (value as QuestionDifficulty) 
    : 'medium';
};

/**
 * Get a color class based on difficulty
 * @param difficulty Question difficulty level
 * @returns Tailwind CSS class string for the appropriate color
 */
export const getDifficultyColorClass = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

/**
 * Format text with proper capitalization
 * @param text Text to format
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
