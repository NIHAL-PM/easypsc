
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { KeyIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ApiKeyManager = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [newsApiKey, setNewsApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeminiKeyValid, setIsGeminiKeyValid] = useState(false);
  const [isNewsKeyValid, setIsNewsKeyValid] = useState(false);
  const { toast } = useToast();

  // Load existing API keys from Supabase
  useEffect(() => {
    const loadApiKeys = async () => {
      setIsLoading(true);
      try {
        // Get Gemini API key
        const { data: geminiKeyData, error: geminiError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'GEMINI_API_KEY')
          .single();

        if (geminiKeyData && !geminiError) {
          setGeminiApiKey(geminiKeyData.value);
          setIsGeminiKeyValid(true);
        }

        // Get News API key
        const { data: newsKeyData, error: newsError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'NEWS_API_KEY')
          .single();

        if (newsKeyData && !newsError) {
          setNewsApiKey(newsKeyData.value);
          setIsNewsKeyValid(true);
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKeys();
  }, []);

  const saveApiKey = async (keyType: 'GEMINI_API_KEY' | 'NEWS_API_KEY', value: string) => {
    setIsLoading(true);
    try {
      // Check if key already exists
      const { data, error: selectError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', keyType)
        .single();

      if (data && !selectError) {
        // Update existing key
        const { error: updateError } = await supabase
          .from('settings')
          .update({ value })
          .eq('key', keyType);

        if (updateError) throw updateError;
      } else {
        // Insert new key
        const { error: insertError } = await supabase
          .from('settings')
          .insert({ key: keyType, value });

        if (insertError) throw insertError;
      }

      toast({
        title: 'API Key Saved',
        description: `Your ${keyType === 'GEMINI_API_KEY' ? 'Gemini' : 'News'} API key has been saved.`,
        variant: 'default',
      });

      // Update validation state
      if (keyType === 'GEMINI_API_KEY') {
        setIsGeminiKeyValid(true);
      } else {
        setIsNewsKeyValid(true);
      }
    } catch (error) {
      console.error(`Error saving ${keyType}:`, error);
      toast({
        title: 'Error Saving API Key',
        description: `There was a problem saving your ${keyType === 'GEMINI_API_KEY' ? 'Gemini' : 'News'} API key.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeminiKey = () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter a valid Gemini API key',
        variant: 'destructive'
      });
      return;
    }
    saveApiKey('GEMINI_API_KEY', geminiApiKey);
  };

  const handleSaveNewsKey = () => {
    if (!newsApiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter a valid News API key',
        variant: 'destructive'
      });
      return;
    }
    saveApiKey('NEWS_API_KEY', newsApiKey);
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5 text-primary" />
            <CardTitle>API Key Management</CardTitle>
          </div>
          <CardDescription>
            Configure the API keys required for the application features
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="geminiApiKey">Gemini API Key</Label>
              {isGeminiKeyValid && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Valid</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                id="geminiApiKey"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="font-mono flex-1"
              />
              <Button 
                onClick={handleSaveGeminiKey} 
                disabled={isLoading}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Required for AI question generation and chat features
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="newsApiKey">News API Key</Label>
              {isNewsKeyValid && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Valid</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                id="newsApiKey"
                type="password"
                value={newsApiKey}
                onChange={(e) => setNewsApiKey(e.target.value)}
                placeholder="Enter your News API key"
                className="font-mono flex-1"
              />
              <Button 
                onClick={handleSaveNewsKey}
                disabled={isLoading}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Required for the news feed feature
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="text-amber-800 dark:text-amber-300">
                <p>You can get a Gemini API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.</p>
                <p className="mt-2">For News, get an API key from <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="underline">News API</a>.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
