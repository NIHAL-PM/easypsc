
// Environment variable utilities
export const getGeminiApiKey = (): string | undefined => {
  return import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
};

export const isGeminiApiKeyConfigured = (): boolean => {
  const apiKey = getGeminiApiKey();
  return apiKey !== undefined && apiKey !== '';
};
