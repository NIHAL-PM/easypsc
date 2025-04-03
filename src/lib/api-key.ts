import { supabase } from '@/integrations/supabase/client';

// Default API keys for development only (these would normally be redacted)
const DEFAULT_API_KEYS = {
  GEMINI_API_KEY: 'AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik',
  NEWS_API_KEY: '7c64a4f4675a425ebe9fc4895fc6e273'
};

/**
 * Initialize default API keys if they're not already set
 * This ensures that the app can function without requiring the user to set up API keys
 */
export const initializeDefaultApiKeys = async (): Promise<void> => {
  try {
    console.log('Initializing default API keys...');
    
    // Check if keys are already in localStorage
    for (const [key, defaultValue] of Object.entries(DEFAULT_API_KEYS)) {
      const storedValue = localStorage.getItem(key);
      
      if (!storedValue) {
        // Try to fetch from Supabase first
        try {
          const { data, error } = await supabase.functions.invoke('admin-settings', {
            body: { action: 'get', key }
          });
          
          if (!error && data?.value) {
            // If key exists in Supabase, use that
            localStorage.setItem(key, data.value);
            console.log(`Retrieved ${key} from Supabase settings`);
          } else {
            // Otherwise set default
            localStorage.setItem(key, defaultValue);
            console.log(`Set default ${key}`);
          }
        } catch (error) {
          // If Supabase call fails, set default
          console.warn(`Error retrieving ${key} from Supabase:`, error);
          localStorage.setItem(key, defaultValue);
          console.log(`Fallback to default ${key}`);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing API keys:', error);
  }
};

/**
 * Check if the Gemini API key is configured in localStorage or Supabase
 */
export const isGeminiApiKeyConfigured = (): boolean => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  return !!apiKey;
};

/**
 * Helper function to get API key 
 * First tries localStorage, then falls back to Supabase
 */
export const getApiKey = async (key: string): Promise<string | null> => {
  // First check localStorage
  const localValue = localStorage.getItem(key);
  if (localValue) {
    return localValue;
  }
  
  // If not in localStorage, try getting from Supabase
  try {
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: { action: 'get', key }
    });
    
    if (error) {
      console.error(`Error fetching ${key} from Supabase:`, error);
      return null;
    }
    
    if (data?.value) {
      // Cache in localStorage for future use
      localStorage.setItem(key, data.value);
      return data.value;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return null;
  }
};

/**
 * Helper function to save API key
 * Saves to both localStorage and Supabase
 */
export const saveApiKey = async (key: string, value: string): Promise<boolean> => {
  // Save to localStorage
  localStorage.setItem(key, value);
  
  // Also save to Supabase for persistence
  try {
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: { action: 'set', key, value }
    });
    
    if (error) {
      console.error(`Error saving ${key} to Supabase:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};
