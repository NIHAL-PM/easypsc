
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
