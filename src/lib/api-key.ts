
import { saveApiKey, getApiKey } from '@/services/api';

export const initializeDefaultApiKeys = async () => {
  try {
    // Check if GEMINI_API_KEY exists
    const geminiKey = await getApiKey('GEMINI_API_KEY');
    if (!geminiKey) {
      console.log('Setting default Gemini API key...');
      // You can set a default key here if needed
      // await saveApiKey('GEMINI_API_KEY', 'default-key');
    }
    
    // Check if NEWS_API_KEY exists
    const newsKey = await getApiKey('NEWS_API_KEY');
    if (!newsKey) {
      console.log('Setting default News API key...');
      await saveApiKey('NEWS_API_KEY', '7c64a4f4675a425ebe9fc4895fc6e273');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing API keys:', error);
    return false;
  }
};
