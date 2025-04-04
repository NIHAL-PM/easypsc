
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { saveApiKey, validateApiKey } from '@/services/api';
import { motion } from 'framer-motion';
import { KeyIcon, LockIcon, ShieldCheck } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  apiType?: 'GEMINI_API_KEY' | 'NEWS_API_KEY';
  title?: string;
  description?: string;
}

const ApiKeyInput = ({ 
  onApiKeySubmit,
  apiType = 'GEMINI_API_KEY',
  title = 'API Key Required',
  description = 'Please enter your Gemini API key to generate questions'
}: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter a valid API key',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate API key
      const isValid = await validateApiKey(apiType, apiKey);
      
      if (isValid) {
        // Save API key
        await saveApiKey(apiType, apiKey);
        
        toast({
          title: 'API Key Saved',
          description: 'Your API key has been saved successfully',
        });
        
        onApiKeySubmit(apiKey);
      } else {
        toast({
          title: 'Invalid API Key',
          description: 'The API key you entered appears to be invalid',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error Saving API Key',
        description: 'An error occurred while saving your API key',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-indigo-500" />
            {title}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <LockIcon className="w-4 h-4 text-indigo-500" />
                  <span>API Key</span>
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-300">
                <p className="flex items-start">
                  <ShieldCheck className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Your API key is stored securely in your browser and is only used to generate questions. 
                    It is never shared with third parties or stored on our servers.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save API Key'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default ApiKeyInput;
