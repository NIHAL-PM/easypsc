
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import QuestionCard from '@/components/QuestionCard';
import ProfileCard from '@/components/ProfileCard';
import QuestionGenerator from '@/components/QuestionGenerator';
import UserSetup from '@/components/UserSetup';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { trackUserActivity } from '@/services/api';

const Index = () => {
  const { user, currentQuestion, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Track page view on first load
  useEffect(() => {
    if (user) {
      trackUserActivity(user.id, 'page_view', {
        page: 'index',
      });
    }
  }, [user?.id]);
  
  if (!user) {
    return <UserSetup />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full py-4">
                  <div className="px-4 py-2">
                    <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
                    <ProfileCard />
                  </div>
                  <div className="px-4 py-2 mt-6">
                    <h2 className="text-lg font-semibold mb-4">Question Settings</h2>
                    <QuestionGenerator />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <div className="rounded-md h-8 w-8 bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">L</span>
              </div>
              <span className="font-bold text-xl hidden md:inline-block">Learnify</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - visible on larger screens */}
          <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24 self-start">
            <div className="space-y-6">
              <ProfileCard />
              <QuestionGenerator />
            </div>
          </aside>
          
          {/* Main content */}
          <main className="flex-1 min-h-[calc(100vh-8rem)]">
            <AnimatePresence mode="wait">
              {currentQuestion ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestionCard question={currentQuestion} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                  <div className="max-w-md space-y-4 p-6">
                    <h2 className="text-2xl font-bold tracking-tight">No questions yet</h2>
                    <p className="text-muted-foreground">
                      Generate your first set of questions to start practicing for your {user.examType} exam.
                    </p>
                    <div className="lg:hidden">
                      <QuestionGenerator />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Learnify. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
