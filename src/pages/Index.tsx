
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
import { supabase } from '@/integrations/supabase/client';
import UserSetup from '@/components/UserSetup';
import { initializeDefaultApiKeys } from '@/lib/api-key';

const Index = () => {
  const { user, setUser, currentQuestion } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'chat' | 'community' | 'news'>('questions');
  
  // Check if user is already authenticated with Supabase on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize API keys
        await initializeDefaultApiKeys();
        
        // Check current auth session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking authentication:', error);
          setIsLoading(false);
          return;
        }
        
        if (data?.session?.user) {
          // User is authenticated, get their profile info
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          
          if (profileData) {
            // Set user in our app state
            setUser({
              id: data.session.user.id,
              name: profileData?.full_name || 'User',
              email: data.session.user.email || '',
              examType: (profileData?.preferred_exams?.[0] as ExamType) || 'UPSC',
              preferredLanguage: profileData?.preferred_language || 'english',
              isPremium: false, // This would come from your subscription system
              monthlyQuestionsRemaining: 10,
              questionsAnswered: 0,
              questionsCorrect: 0,
              currentStreak: 0,
              lastActive: new Date(),
              lastQuestionTime: null,
              weakCategories: {},
              strongCategories: {}
            });
          } else {
            // If no profile exists yet (possible if auth was set up but profile wasn't created)
            setUser({
              id: data.session.user.id,
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email || '',
              examType: 'UPSC',
              preferredLanguage: 'english',
              isPremium: false,
              monthlyQuestionsRemaining: 10,
              questionsAnswered: 0,
              questionsCorrect: 0,
              currentStreak: 0,
              lastActive: new Date(),
              lastQuestionTime: null,
              weakCategories: {},
              strongCategories: {}
            });
          }
        }
      } catch (err) {
        console.error('Unexpected error during auth check:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoading(true);
          
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            setUser({
              id: session.user.id,
              name: profileData?.full_name || 'User',
              email: session.user.email || '',
              examType: (profileData?.preferred_exams?.[0] as ExamType) || 'UPSC',
              preferredLanguage: profileData?.preferred_language || 'english',
              isPremium: false,
              monthlyQuestionsRemaining: 10,
              questionsAnswered: 0,
              questionsCorrect: 0,
              currentStreak: 0,
              lastActive: new Date(),
              lastQuestionTime: null,
              weakCategories: {},
              strongCategories: {}
            });
          }
          
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);
  
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
