
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first letter of each word in a name to create initials
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Safe wrapper for Object.entries when the input might be null or undefined
 */
export function safeObjectEntries<T>(obj: T | null | undefined): [string, any][] {
  if (obj === null || obj === undefined) {
    return [];
  }
  return Object.entries(obj as any);
}

/**
 * Available languages for the application
 */
export const AVAILABLE_LANGUAGES = [
  { code: 'english', name: 'English' },
  { code: 'hindi', name: 'Hindi' },
  { code: 'tamil', name: 'Tamil' },
  { code: 'telugu', name: 'Telugu' },
  { code: 'kannada', name: 'Kannada' },
  { code: 'marathi', name: 'Marathi' },
  { code: 'bengali', name: 'Bengali' },
  { code: 'gujarati', name: 'Gujarati' },
  { code: 'urdu', name: 'Urdu' },
  { code: 'punjabi', name: 'Punjabi' },
];
