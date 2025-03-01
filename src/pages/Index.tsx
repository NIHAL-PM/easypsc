import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import UserSetup from '@/components/UserSetup';
import QuestionCard from '@/components/QuestionCard';
import QuestionGenerator from '@/components/QuestionGenerator';
import ProfileCard from '@/components/ProfileCard';
import AnimatedLogo from '@/components/AnimatedLogo';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminPanel from '@/components/AdminPanel';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { generateQuestions } from '@/services/api';
import { motion } from 'framer-motion';

const Index = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const { 
    user, 
    currentQuestion,
    questions,
    isLoading,
    setQuestions,
    setCurrentQuestion,
    askedQuestionIds
  } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    if (adminParam === 'true') {
      setIsAdmin(true);
    }
  }, []);
  
  useEffect(() => {
    const loadDemoQuestions = async () => {
      if (user && !currentQuestion && questions.length === 0 && !isLoading) {
        try {
          const demoQuestions = await generateQuestions({
            examType: user.examType,
            difficulty: 'medium',
            count: 3,
            askedQuestionIds
          });
          
          if (demoQuestions.length > 0) {
            setQuestions(demoQuestions);
            setCurrentQuestion(demoQuestions[0]);
          }
        } catch (error) {
          console.error('Failed to load demo questions:', error);
        }
      }
    };
    
    loadDemoQuestions();
  }, [user, currentQuestion, questions, isLoading, setQuestions, setCurrentQuestion, askedQuestionIds]);
  
  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner size="lg" text="Loading EasyPSC..." />
        </motion.div>
      </div>
    );
  }
  
  if (isAdmin) {
    return <AdminPanel />;
  }
  
  if (isUpgrading) {
    return <PremiumUpgrade />;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 max-w-5xl">
        <AnimatedLogo />
        <UserSetup />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <AnimatedLogo />
      
      <div className="flex justify-between items-center mb-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="practice" className="space-y-6 mt-6">
            {!user.isPremium && user.monthlyQuestionsRemaining < 5 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 p-4 bg-accent/20 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">Limited questions remaining</h3>
                  <p className="text-sm text-muted-foreground">
                    You have {user.monthlyQuestionsRemaining} questions left this month
                  </p>
                </div>
                <Button onClick={() => setIsUpgrading(true)}>
                  Upgrade to Premium
                </Button>
              </motion.div>
            )}
            
            <QuestionGenerator />
            
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <QuestionCard />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <p className="text-muted-foreground mb-4">
                  No questions loaded. Generate some questions to start practicing!
                </p>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileCard />
              
              {!user.isPremium && (
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsUpgrading(true)} 
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
