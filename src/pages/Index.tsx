
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
import { Menu, Bell, HelpCircle, Info } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
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
          toast({
            title: "Failed to load questions",
            description: "Please try again later or check your connection.",
            variant: "destructive"
          });
        }
      }
    };
    
    loadDemoQuestions();
  }, [user, currentQuestion, questions, isLoading, setQuestions, setCurrentQuestion, askedQuestionIds, toast]);
  
  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner size="lg" text="Loading EasyPSC..." useAnimatedText={true} />
        </motion.div>
      </div>
    );
  }
  
  if (isAdmin) {
    return <AdminPanel />;
  }
  
  if (isUpgrading) {
    return <PremiumUpgrade onCancel={() => setIsUpgrading(false)} />;
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <AnimatedLogo />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-card">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No new notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast({ title: "FAQs", description: "Frequently asked questions section coming soon." })}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>FAQs</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Contact Support", description: "Support team is available 24/7." })}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>Contact Support</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 flex items-center">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline-block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                  <span>Profile</span>
                </DropdownMenuItem>
                {!user.isPremium && (
                  <DropdownMenuItem onClick={() => setIsUpgrading(true)}>
                    <span>Upgrade to Premium</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Logged out",
                    description: "You have been successfully logged out"
                  });
                  window.location.reload();
                }}>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-6 max-w-5xl">
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mb-6 bg-card rounded-lg border border-border/40 overflow-hidden"
          >
            <div className="p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  setActiveTab('practice');
                  setIsMobileMenuOpen(false);
                }}
              >
                Practice
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
              >
                Profile
              </Button>
              {!user.isPremium && (
                <Button 
                  variant="default" 
                  className="w-full mt-2" 
                  onClick={() => {
                    setIsUpgrading(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </motion.div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sticky top-[5rem] z-10 bg-background/60 backdrop-blur-sm">
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="practice" className="space-y-6 mt-6">
              {!user.isPremium && user.monthlyQuestionsRemaining < 5 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 bg-accent/20 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-medium text-center sm:text-left">Limited questions remaining</h3>
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
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
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-card py-2 px-4 text-center text-sm text-muted-foreground z-10">
        <div className="container mx-auto flex justify-between items-center">
          <p>© {new Date().getFullYear()} EasyPSC</p>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toast({ 
                title: "Privacy Policy", 
                description: "Your data is secure and never shared with third parties." 
              })}
            >
              Privacy
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toast({ 
                title: "Terms of Service", 
                description: "By using this service, you agree to our terms and conditions." 
              })}
            >
              Terms
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
