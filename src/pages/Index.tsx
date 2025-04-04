
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import QuestionCard from '@/components/QuestionCard';
import QuestionGenerator from '@/components/QuestionGenerator';
import AnimatedLogo from '@/components/AnimatedLogo';
import ProfileCard from '@/components/ProfileCard';
import ChatMode from '@/components/ChatMode';
import ChatRoom from '@/components/ChatRoom';
import NewsFeed from '@/components/NewsFeed';
import { ArrowRight, BookOpen, UsersRound, MessageSquare, Newspaper } from 'lucide-react';
import { ExamType } from '@/types';
import UserSetup from '@/components/UserSetup';
import { initializeDefaultApiKeys } from '@/lib/api-key';

const Index = () => {
  const { user, isLoading, currentQuestion } = useAppStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'questions' | 'chat' | 'community' | 'news'>('questions');
  
  // Initialize API keys on component mount
  useEffect(() => {
    const setupApiKeys = async () => {
      try {
        await initializeDefaultApiKeys();
      } catch (error) {
        console.error('Error initializing API keys:', error);
      }
    };
    
    setupApiKeys();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40">
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <AnimatedLogo />
        </div>
      ) : !user ? (
        <UserSetup />
      ) : (
        <div className="container mx-auto py-6 px-4">
          <AnimatedLogo />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ProfileCard />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'questions' | 'chat' | 'community' | 'news')} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="questions" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Practice
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger value="community" className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4" />
                    Community
                  </TabsTrigger>
                  <TabsTrigger value="news" className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    News
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="questions" className="space-y-4 m-0">
                  {!currentQuestion ? <QuestionGenerator /> : <QuestionCard />}
                </TabsContent>
                
                <TabsContent value="chat" className="m-0">
                  <ChatMode />
                </TabsContent>

                <TabsContent value="community" className="m-0">
                  <ChatRoom examType={user.examType} />
                </TabsContent>

                <TabsContent value="news" className="m-0">
                  <NewsFeed />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
