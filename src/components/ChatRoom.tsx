
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Send, Users, UserIcon } from 'lucide-react';

const ChatRoom = () => {
  const { user, sendChatMessage, allUsers, chatMessages, getChatMessagesByExamType } = useAppStore();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Get messages for the current user's exam type
  const examTypeMessages = user ? getChatMessagesByExamType(user.examType) : [];
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [examTypeMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    try {
      sendChatMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send your message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Get number of users studying for same exam
  const examPeers = user 
    ? allUsers.filter(u => u.examType === user.examType && u.id !== user.id).length 
    : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Exam Chat Room</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <UserIcon className="h-3.5 w-3.5" />
            <span>{examPeers} peers online</span>
          </div>
        </div>
        <CardDescription>
          Chat with others preparing for {user?.examType || 'your exam'}
        </CardDescription>
      </CardHeader>
      
      <ScrollArea className="h-[400px] px-4 py-3" ref={scrollRef}>
        <div className="flex flex-col gap-3">
          {examTypeMessages.length === 0 ? (
            <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
              Be the first to start the conversation!
            </div>
          ) : (
            examTypeMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.senderId === user?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {msg.senderId === user?.id ? 'You' : msg.senderName}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="border-t p-3">
        <div className="flex w-full gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
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
            disabled={!message.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatRoom;
