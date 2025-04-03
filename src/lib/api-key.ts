import { getApiKey as fetchApiKey, saveApiKey as storeApiKey } from '@/services/api';

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
          const apiKey = await fetchApiKey(key);
          
          if (apiKey) {
            // If key exists in Supabase, use that
            localStorage.setItem(key, apiKey);
            console.log(`Retrieved ${key} from Supabase settings`);
          } else {
            // Otherwise set default
            localStorage.setItem(key, defaultValue);
            await storeApiKey(key, defaultValue);
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
 * This delegates to the services/api.ts implementation
 */
export const getApiKey = fetchApiKey;

/**
 * Helper function to save API key
 * This delegates to the services/api.ts implementation
 */
export const saveApiKey = storeApiKey;
