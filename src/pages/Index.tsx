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
import { Menu, Bell, HelpCircle, Info, LogOut, Home, User, Settings } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    user, 
    currentQuestion,
    questions,
    isLoading,
    setQuestions,
    setCurrentQuestion,
    askedQuestionIds,
    logout
  } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2500);
    
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
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    window.location.reload();
  };
  
  if (pageLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <div className="backdrop-blur-lg bg-background/60 p-8 rounded-xl shadow-lg border border-primary/20 max-w-sm">
          <div className="relative">
            <AnimatedLogo />
            <div className="mt-6">
              <LoadingSpinner size="lg" color="primary" useAnimatedText={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isAdmin) {
    return <AdminPanel />;
  }
  
  if (isUpgrading) {
    return <PremiumUpgrade onClose={() => setIsUpgrading(false)} />;
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pb-24">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 max-w-5xl mx-auto">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden mr-2" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <AnimatedLogo />
            </div>
            <div className="sm:hidden">
              <h2 className="text-lg font-semibold">EasyPSC</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] text-white">2</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-card/95 backdrop-blur-sm border border-border/40">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <div className="p-3 hover:bg-accent/50 rounded-md cursor-pointer transition-colors">
                    <p className="text-sm font-medium">New questions available</p>
                    <p className="text-xs text-muted-foreground">Your daily questions have been refreshed</p>
                  </div>
                  <div className="p-3 hover:bg-accent/50 rounded-md cursor-pointer transition-colors">
                    <p className="text-sm font-medium">Premium offer</p>
                    <p className="text-xs text-muted-foreground">50% off for the next 24 hours!</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 flex items-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-primary">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="hidden md:inline-block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border border-border/40">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {user && !user.isPremium && (
                  <DropdownMenuItem onClick={() => setIsUpgrading(true)}>
                    <span>Upgrade to Premium</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-4 max-w-5xl">
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mb-4 bg-card/95 backdrop-blur-sm rounded-lg border border-border/40 overflow-hidden"
          >
            <div className="p-3 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm gap-2" 
                onClick={() => {
                  setActiveTab('practice');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Home size={16} />
                Practice
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm gap-2" 
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
              >
                <User size={16} />
                Profile
              </Button>
              {user && !user.isPremium && (
                <Button 
                  variant="gradient" 
                  size="sm"
                  className="w-full mt-1" 
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
        
        <div className="flex justify-between items-center mb-4">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sticky top-[3.5rem] z-10 bg-background/60 backdrop-blur-sm">
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="practice" className="space-y-4 mt-4">
              {user && !user.isPremium && user.monthlyQuestionsRemaining < 5 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3 p-3 bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2"
                >
                  <div>
                    <h3 className="font-medium text-center sm:text-left text-sm">Limited questions remaining</h3>
                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                      You have {user.monthlyQuestionsRemaining} questions left this month
                    </p>
                  </div>
                  <Button onClick={() => setIsUpgrading(true)} variant="gradient-secondary" size="sm">
                    Upgrade to Premium
                  </Button>
                </motion.div>
              )}
              
              <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-lg p-3 p-mobile-4">
                <QuestionGenerator />
              </div>
              
              {currentQuestion ? (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative"
                >
                  <QuestionCard />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-col items-center justify-center py-8 bg-card/95 backdrop-blur-sm border border-border/40 rounded-lg"
                >
                  <p className="text-muted-foreground mb-4 text-sm">
                    No questions loaded. Generate some questions to start practicing!
                  </p>
                  <Button variant="gradient" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Generate Questions
                  </Button>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="profile" className="mt-4">
              <ProfileCard />
              
              {user && !user.isPremium && (
                <div className="mt-4">
                  <Button 
                    onClick={() => setIsUpgrading(true)} 
                    variant="gradient"
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-card/95 backdrop-blur-sm py-1.5 px-3 text-center text-xs text-muted-foreground z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <p>© {new Date().getFullYear()} EasyPSC</p>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toast({ 
                title: "Privacy Policy", 
                description: "Your data is secure and never shared with third parties." 
              })}
              className="text-xs h-7 px-2"
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
              className="text-xs h-7 px-2"
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
