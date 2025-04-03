
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send, KeyIcon, AlertTriangle } from 'lucide-react';
import { generateChat, getApiKey } from '@/services/api';
import { useAppStore } from '@/lib/store';
import ApiKeyInput from './ApiKeyInput';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMode: React.FC = () => {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        setIsCheckingApiKey(true);
        const geminiKey = await getApiKey('GEMINI_API_KEY');
        setApiKeyConfigured(!!geminiKey);
      } catch (error) {
        console.error('Error checking API key:', error);
        setApiKeyConfigured(false);
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    
    checkApiKey();
  }, []);

  const handleApiKeySubmit = (apiKey: string) => {
    setApiKeyConfigured(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    const userMessage = inputValue.trim();
    
    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage }
    ]);
    setInputValue('');
    
    try {
      // Call the API
      const response = await generateChat(userMessage);
      
      if (response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response }
        ]);
      } else {
        throw new Error('Empty response from assistant');
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I encountered an issue generating a response. Please try again." }
      ]);
      
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCheckingApiKey) {
    return (
      <Card className="border shadow-md h-[600px] flex items-center justify-center">
        <CardContent>
          <p className="text-center text-muted-foreground">
            Checking API configuration...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!apiKeyConfigured) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <Card className="border shadow-md h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>AI Chat Mode</CardTitle>
          </div>
        </div>
        <CardDescription>
          Chat with an AI assistant to get your doubts cleared
        </CardDescription>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`
                    max-w-[80%] rounded-lg px-3 py-2 
                    ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                    }
                  `}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user?.name.substring(0, 2).toUpperCase() || 'ME'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="p-4 border-t">
        <div className="flex items-center gap-2 w-full">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="icon" 
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatMode;
