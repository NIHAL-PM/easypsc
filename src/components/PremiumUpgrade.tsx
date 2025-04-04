
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, X, Package, Star, Sparkles, Lock, Check, BarChart4, Book } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

const PremiumUpgrade = () => {
  const navigate = useNavigate();
  const { user, upgradeUserToPremium } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // User already has premium
  if (user?.isPremium) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 shadow-lg border-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300"></div>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              You&apos;re a Premium Member
            </CardTitle>
            <CardDescription>
              Enjoy all the benefits of your premium membership!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-300 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Thank you for supporting our platform!</h3>
            <p className="mt-2 text-muted-foreground">
              You have unlimited access to all features and content.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')} className="px-8">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const handleUpgrade = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      upgradeUserToPremium();
      navigate('/');
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-300">
              Upgrade to Premium
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlock all features and take your exam preparation to the next level
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-slate-600" />
                  Free Plan
                </CardTitle>
                <CardDescription>Current plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-3xl font-bold">₹0</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">Generate 10 questions per month</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">Basic question difficulty levels</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">Single exam type selection</p>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">AI assistant chat (Limited)</p>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">Advanced analytics</p>
                  </div>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-slate-300 dark:text-slate-600 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">Topic-specific question sets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-900 shadow-lg border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300"></div>
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-1 rounded-full text-xs font-semibold text-white">
                  Recommended
                </span>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Premium Plan
                </CardTitle>
                <CardDescription>Unlock all features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-3xl font-bold">₹199</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm"><span className="font-semibold">Unlimited</span> question generation</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm"><span className="font-semibold">Advanced</span> difficulty levels & customization</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">All exam types and subjects</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">Unlimited AI assistant chat</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">Detailed performance analytics</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm">Create topic-specific question sets</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl border-0" 
                  onClick={handleUpgrade}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade Now
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Premium Features in Detail
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-6 shadow-sm">
              <div className="rounded-full w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Book className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Unlimited Content</h3>
              <p className="text-sm text-muted-foreground">Generate unlimited practice questions across all subjects and difficulty levels.</p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-6 shadow-sm">
              <div className="rounded-full w-12 h-12 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Premium Features</h3>
              <p className="text-sm text-muted-foreground">Access advanced difficulty levels, custom question sets, and personalized learning.</p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-6 shadow-sm">
              <div className="rounded-full w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <BarChart4 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Detailed Analytics</h3>
              <p className="text-sm text-muted-foreground">Track your progress with detailed statistics, identify weak areas, and focus your studies.</p>
            </div>
          </div>
          
          <Separator className="my-12" />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Have questions about our premium plan? Contact us at support@easypsc.com
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgrade;
