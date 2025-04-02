
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to save an API key to Supabase
 */
export const saveApiKey = async (key: string, value: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'set',
        key,
        value
      }
    });
    
    if (error) {
      console.error('Error saving API key:', error);
      return false;
    }
    
    // Also store in localStorage for quick access
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

/**
 * Helper function to get an API key from Supabase or localStorage
 */
export const getApiKey = async (key: string): Promise<string | null> => {
  // First check localStorage for quick access
  const localValue = localStorage.getItem(key);
  if (localValue) {
    return localValue;
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'get',
        key
      }
    });
    
    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }
    
    if (data?.value) {
      // Store in localStorage for future quick access
      localStorage.setItem(key, data.value);
      return data.value;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
};

/**
 * Helper function to verify if a required API key is configured
 */
export const verifyApiKeyConfigured = async (key: string): Promise<boolean> => {
  const value = await getApiKey(key);
  return !!value;
};

/**
 * Create or ensure settings table exists
 */
export const ensureSettingsTableExists = async (): Promise<boolean> => {
  try {
    // Use the proper edge function to create the settings table
    const { data, error } = await supabase.functions.invoke('admin-settings', {
      body: {
        action: 'ensure-table-exists'
      }
    });
    
    if (error) {
      console.error('Error ensuring settings table exists:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureSettingsTableExists:', error);
    return false;
  }
};

/**
 * Initialize default API keys
 */
export const initializeDefaultApiKeys = async (): Promise<void> => {
  // First ensure the settings table exists
  await ensureSettingsTableExists();
  
  // Check if Gemini API key exists, if not, set the default one
  const geminiKey = await getApiKey('GEMINI_API_KEY');
  if (!geminiKey) {
    await saveApiKey('GEMINI_API_KEY', 'AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik');
  }
  
  // Check if News API key exists, if not, set the default one
  const newsApiKey = await getApiKey('NEWS_API_KEY');
  if (!newsApiKey) {
    await saveApiKey('NEWS_API_KEY', '7c64a4f4675a425ebe9fc4895fc6e273');
  }
};
