
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveApiKey, getApiKey } from '@/lib/api-key';

interface ApiKeyManagerProps {
  onApiKeyConfigured?: (isConfigured: boolean) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const { toast } = useToast();

  // Check if API key is already configured
  useEffect(() => {
    const checkApiKey = async () => {
      const storedKey = await getApiKey('GEMINI_API_KEY');
      if (storedKey) {
        setApiKey(storedKey);
        setIsKeyConfigured(true);
        if (onApiKeyConfigured) {
          onApiKeyConfigured(true);
        }
      }
    };

    checkApiKey();
  }, [onApiKeyConfigured]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveApiKey('GEMINI_API_KEY', apiKey);
      
      if (saved) {
        setIsKeyConfigured(true);
        toast({
          title: "API Key Saved",
          description: "Your API key has been saved successfully.",
          variant: "default",
        });
        
        if (onApiKeyConfigured) {
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Gemini API Key
        </CardTitle>
        <CardDescription>
          Configure your Gemini API key to enable AI features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isKeyConfigured ? (
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
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input 
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely and used only for generating AI content.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveApiKey}
          disabled={isSaving || !apiKey.trim()}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save API Key"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyManager;
