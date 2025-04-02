
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

/**
 * Get a specific API key by its name
 */
export const getApiKey = async (keyName: string): Promise<string | null> => {
  // Try to get from localStorage first
  const storedKey = localStorage.getItem(keyName);
  if (storedKey) {
    return storedKey;
  }
  
  // If not in localStorage, try to get from Supabase settings
  try {
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'get',
        key: keyName
      }
    });
    
    if (error) {
      console.error(`Error getting ${keyName}:`, error);
      return null;
    }
    
    return data?.value || DEFAULT_API_KEYS[keyName as keyof typeof DEFAULT_API_KEYS] || null;
  } catch (error) {
    console.error(`Error getting ${keyName}:`, error);
    return DEFAULT_API_KEYS[keyName as keyof typeof DEFAULT_API_KEYS] || null;
  }
};

/**
 * Save an API key
 */
export const saveApiKey = async (keyName: string, value: string): Promise<boolean> => {
  try {
    // Save to localStorage
    localStorage.setItem(keyName, value);
    
    // Also save to Supabase settings
    const { error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'set',
        key: keyName,
        value
      }
    });
    
    if (error) {
      console.error(`Error saving ${keyName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving ${keyName}:`, error);
    return false;
  }
};
