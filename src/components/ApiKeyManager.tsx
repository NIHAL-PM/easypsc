
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getApiKey, saveApiKey } from '@/services/api'; // Changed from lib/api-key

interface ApiKeyManagerProps {
  onApiKeyConfigured?: (isConfigured: boolean) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyConfigured }) => {
  const [apiKeys, setApiKeys] = useState({
    GEMINI_API_KEY: '',
    NEWS_API_KEY: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState({
    GEMINI_API_KEY: false,
    NEWS_API_KEY: false
  });
  const { toast } = useToast();

  // Check if API keys are already configured
  useEffect(() => {
    const checkApiKeys = async () => {
      const geminiKey = await getApiKey('GEMINI_API_KEY');
      const newsApiKey = await getApiKey('NEWS_API_KEY');
      
      setApiKeys({
        GEMINI_API_KEY: geminiKey || '',
        NEWS_API_KEY: newsApiKey || ''
      });
      
      const newKeyStatus = {
        GEMINI_API_KEY: !!geminiKey,
        NEWS_API_KEY: !!newsApiKey
      };
      
      setKeyStatus(newKeyStatus);
      
      if (onApiKeyConfigured) {
        onApiKeyConfigured(!!geminiKey);
      }
    };

    checkApiKeys();
  }, [onApiKeyConfigured]);

  const handleInputChange = (key: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveApiKey = async (keyName: string) => {
    const keyValue = apiKeys[keyName as keyof typeof apiKeys];
    
    if (!keyValue.trim()) {
      toast({
        title: "API Key Required",
        description: `Please enter a valid ${keyName.replace('_', ' ').toLowerCase()}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveApiKey(keyName, keyValue);
      
      if (saved) {
        setKeyStatus(prev => ({
          ...prev,
          [keyName]: true
        }));
        
        toast({
          title: "API Key Saved",
          description: `Your ${keyName.replace('_', ' ').toLowerCase()} has been saved successfully.`,
          variant: "default",
        });
        
        if (keyName === 'GEMINI_API_KEY' && onApiKeyConfigured) {
          onApiKeyConfigured(true);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save API key. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Gemini API Key
          </CardTitle>
          <CardDescription>
            Configure your Gemini API key to enable AI question generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyStatus.GEMINI_API_KEY ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>API key is configured and ready to use.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>API key not configured. Some features may be limited.</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="geminiApiKey">Gemini API Key</Label>
              <Input 
                id="geminiApiKey"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKeys.GEMINI_API_KEY}
                onChange={(e) => handleInputChange('GEMINI_API_KEY', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored securely and used only for generating AI content.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSaveApiKey('GEMINI_API_KEY')}
            disabled={isSaving || !apiKeys.GEMINI_API_KEY.trim()}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Gemini API Key"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            News API Key
          </CardTitle>
          <CardDescription>
            Configure your News API key to enable news feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyStatus.NEWS_API_KEY ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>API key is configured and ready to use.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>API key not configured. News feed may be limited.</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="newsApiKey">News API Key</Label>
              <Input 
                id="newsApiKey"
                type="password"
                placeholder="Enter your News API key"
                value={apiKeys.NEWS_API_KEY}
                onChange={(e) => handleInputChange('NEWS_API_KEY', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored securely and used only for fetching news content.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSaveApiKey('NEWS_API_KEY')}
            disabled={isSaving || !apiKeys.NEWS_API_KEY.trim()}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save News API Key"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
