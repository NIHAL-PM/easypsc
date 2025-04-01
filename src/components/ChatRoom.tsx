
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send, UserIcon, Users } from 'lucide-react';
import { sendChatMessage, getChatMessages } from '@/services/api';
import { useAppStore } from '@/lib/store';
import { ExamType } from '@/types';
import { getInitials } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  exam_category: ExamType;
}

interface ChatRoomProps {
  examType: ExamType;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ examType }) => {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages from the server
  const loadMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const chatMessages = await getChatMessages(examType);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;
    
    // Load initial messages
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `exam_category=eq.${examType}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(currentMessages => [...currentMessages, newMessage]);
      })
      .subscribe();
      
    // Mock active users count updates for demo
    const mockUpdateInterval = setInterval(() => {
      // Random fluctuation in active users count for demo purposes
      const randomChange = Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0;
      setActiveUsers(current => Math.max(1, current + randomChange));
    }, 30000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(mockUpdateInterval);
    };
  }, [user, examType, toast]);
  
  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim()) return;
    
    setIsLoading(true);
    try {
      await sendChatMessage(
        examType,
        user.id,
        user.name,
        newMessage.trim()
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send your message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Card className="border shadow-md h-[600px] flex items-center justify-center">
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please log in to access the chat room
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border shadow-md h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>{examType} Chat Room</CardTitle>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full text-xs">
            <Users className="h-3 w-3" />
            <span>{activeUsers} active</span>
          </div>
        </div>
        <CardDescription>
          Chat with other {examType} aspirants in real-time
        </CardDescription>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                {msg.user_id !== user.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(msg.user_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`
                    max-w-[80%] rounded-lg px-3 py-2 
                    ${msg.user_id === user.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                    }
                  `}
                >
                  {msg.user_id !== user.id && (
                    <p className="text-xs font-medium mb-1">
                      {msg.user_name}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {msg.user_id === user.id && (
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
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatRoom;
