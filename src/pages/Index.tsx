
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
import { Menu, Bell, HelpCircle, Info, LogOut } from 'lucide-react';
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
    }, 2500); // Extended to 2.5s to showcase the loading animation
    
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
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Video Background with overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            className="absolute w-full h-full object-cover opacity-20"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-network-connection-loop-animation-7295-large.mp4" type="video/mp4" />
          </video>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10 backdrop-blur-lg bg-background/60 p-10 rounded-xl shadow-lg border border-primary/20"
        >
          <div className="relative">
            <AnimatedLogo />
            <div className="mt-8">
              <LoadingSpinner size="lg" color="primary" useAnimatedText={true} />
            </div>
          </div>
        </motion.div>
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
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    // Force reload to clear any lingering state
    window.location.reload();
  };
  
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
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <span>Admin Panel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/premium")}>
                  <span>Premium Page</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
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
