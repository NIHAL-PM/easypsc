
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send, KeyIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { generateChat, getApiKey } from '@/services/api';
import { useAppStore } from '@/lib/store';
import ApiKeyInput from './ApiKeyInput';
import { getInitials } from '@/lib/utils';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleApiKeySubmit = (apiKey: string) => {
    setApiKeyConfigured(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsLoading(true);
    
    try {
      // Send message to API and get response
      const response = await generateChat(userMessage);
      
      if (response) {
        // Add assistant response to chat
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get a response. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to get chat response:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while processing your message.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingApiKey) {
    return (
      <Card className="border shadow-md h-[600px] flex items-center justify-center">
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-center text-muted-foreground">
              Checking API configuration...
            </p>
          </div>
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
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
        </div>
        <CardDescription>
          Chat with your AI study assistant for {user?.examType || 'exam'} preparation
        </CardDescription>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation by sending a message!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
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
                
                {msg.role === 'user' && user && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatMode;
