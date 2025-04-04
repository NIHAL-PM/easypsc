
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { SendIcon, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateChat } from '@/services/api';
import { getGeminiApiKey } from '@/lib/env';
import ApiKeyInput from '@/components/ApiKeyInput';

interface ChatResponse {
  text: string;
  timestamp: Date;
  isUser: boolean;
}

const ChatMode = () => {
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatResponse[]>([
    {
      text: "Hello! I'm your exam preparation assistant. Ask me any question related to your exam preparation!",
      timestamp: new Date(),
      isUser: false
    }
  ]);
  const [apiKey, setApiKey] = useState<string | undefined>(localStorage.getItem('GEMINI_API_KEY') || getGeminiApiKey());
  
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Add user message to conversation
    const userMsg = {
      text: userMessage,
      timestamp: new Date(),
      isUser: true
    };
    
    setConversation(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    try {
      // Get the response from Gemini
      const result = await generateChat(userMessage, apiKey || '');
      
      // Add AI response to conversation
      const aiResponse = {
        text: result || "I'm sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        isUser: false
      };
      
      setConversation(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating chat response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setUserMessage('');
    }
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };

  if (!apiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>Chat with AI Assistant</CardTitle>
        </div>
        <CardDescription>
          Ask questions about exam preparation, concepts, or study techniques
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-[400px] overflow-y-auto flex flex-col gap-4">
        {conversation.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.isUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>•</span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex w-full gap-2">
          <Textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your question here..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !userMessage.trim()}
            size="icon"
          >
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-pulse" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatMode;
