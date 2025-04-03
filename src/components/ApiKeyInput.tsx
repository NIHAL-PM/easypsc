
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { KeyIcon, AlertCircle } from 'lucide-react';
import { saveApiKey } from '@/lib/api-key';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter a valid Gemini API key',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Save API key to both localStorage and Supabase
      await saveApiKey('GEMINI_API_KEY', apiKey);
      
      onApiKeySubmit(apiKey);
      
      toast({
        title: 'API Key Saved',
        description: 'Your Gemini API key has been saved.'
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API key. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyIcon className="h-5 w-5 text-primary" />
          <CardTitle>API Key Required</CardTitle>
        </div>
        <CardDescription>
          Please provide a Gemini API key to enable question generation
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="text-amber-800 dark:text-amber-300">
                <p>The Gemini API key is not configured. This key is required for AI-powered question generation.</p>
                <p className="mt-2">You can get a Gemini API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="font-mono"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Save API Key</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeyInput;
