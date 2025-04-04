
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Format date to readable string
export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get user initials for avatar
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Safe object entries to prevent errors with null objects
export function safeObjectEntries<T extends object>(obj: T | null | undefined): [keyof T, T[keyof T]][] {
  if (!obj) return [];
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

// Parse Firebase timestamp to Date
export function parseTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'number') return new Date(timestamp);
  return null;
}

// Check if an API key is valid
export async function validateApiKey(apiType: string, apiKey: string): Promise<boolean> {
  try {
    // Simple validation - a more robust validation would call the API
    return apiKey && apiKey.length > 20;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}
