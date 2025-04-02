
import { supabase } from '@/integrations/supabase/client';

/**
 * Default API keys that are initialized when the application starts
 */
const DEFAULT_API_KEYS = {
  GEMINI_API_KEY: 'AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik',
  NEWS_API_KEY: '7c64a4f4675a425ebe9fc4895fc6e273'
};

/**
 * Initialize default API keys if they are not already set
 */
export const initializeDefaultApiKeys = async (): Promise<void> => {
  try {
    // First check if keys are already in localStorage
    const storedGeminiKey = localStorage.getItem('GEMINI_API_KEY');
    const storedNewsApiKey = localStorage.getItem('NEWS_API_KEY');
    
    // Initialize Gemini API key if not present
    if (!storedGeminiKey) {
      localStorage.setItem('GEMINI_API_KEY', DEFAULT_API_KEYS.GEMINI_API_KEY);
      console.log('Default Gemini API key initialized');
      
      // Also save it to Supabase settings
      await supabase.functions.invoke('admin-settings', {
        body: {
          action: 'set',
          key: 'GEMINI_API_KEY',
          value: DEFAULT_API_KEYS.GEMINI_API_KEY
        }
      });
    }
    
    // Initialize News API key if not present
    if (!storedNewsApiKey) {
      localStorage.setItem('NEWS_API_KEY', DEFAULT_API_KEYS.NEWS_API_KEY);
      console.log('Default News API key initialized');
      
      // Also save it to Supabase settings
      await supabase.functions.invoke('admin-settings', {
        body: {
          action: 'set',
          key: 'NEWS_API_KEY',
          value: DEFAULT_API_KEYS.NEWS_API_KEY
        }
      });
    }
  } catch (error) {
    console.error('Error initializing API keys:', error);
  }
};

/**
 * Get the Gemini API key
 */
export const getGeminiApiKey = (): string => {
  return localStorage.getItem('GEMINI_API_KEY') || DEFAULT_API_KEYS.GEMINI_API_KEY;
};

/**
 * Get the News API key
 */
export const getNewsApiKey = (): string => {
  return localStorage.getItem('NEWS_API_KEY') || DEFAULT_API_KEYS.NEWS_API_KEY;
};

/**
 * Check if the Gemini API key is configured
 */
export const isGeminiApiKeyConfigured = (): boolean => {
  return !!localStorage.getItem('GEMINI_API_KEY') || !!DEFAULT_API_KEYS.GEMINI_API_KEY;
};

/**
 * Check if the News API key is configured
 */
export const isNewsApiKeyConfigured = (): boolean => {
  return !!localStorage.getItem('NEWS_API_KEY') || !!DEFAULT_API_KEYS.NEWS_API_KEY;
};

/**
 * Check if the admin credentials are valid
 */
export const validateAdminCredentials = (username: string, password: string): boolean => {
  return username === 'bluewaterbottle' && password === 'waterbottle';
};
