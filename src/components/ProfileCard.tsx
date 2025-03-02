
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { CrownIcon, LineChart, ArrowRight, Award, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileCard = () => {
  const { user, getUserStats } = useAppStore();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const stats = getUserStats();
  const accuracy = stats.accuracyPercentage.toFixed(1);
  const questionsRemaining = user.monthlyQuestionsRemaining;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm liquid-card">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow blur-sm opacity-70"></div>
              <Avatar className="w-16 h-16 border-2 border-background relative">
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-lg">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {user.examType} Aspirant
                {user.isPremium && (
                  <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-amber-500 to-yellow-300 text-white">
                    <CrownIcon className="w-3 h-3 mr-0.5" /> PREMIUM
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{user.questionsAnswered} questions</span>
            </div>
            <div className="h-2 rounded-full bg-accent/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(user.questionsAnswered, 100)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/10">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{accuracy}%</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Award className="w-4 h-4" /> Accuracy
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/10">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{stats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" /> Correct
                </div>
              </div>
            </div>
          </div>
          
          {!user.isPremium && (
            <div className="p-4 rounded-lg border border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-900/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-300 text-white flex-shrink-0">
                  <CrownIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Free Plan</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    You have <span className="font-semibold">{questionsRemaining}</span> questions remaining this month.
                  </p>
                  <Button 
                    variant="gradient-secondary" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => navigate("/premium")}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="gradient-outline" className="w-full" size="sm">
            <LineChart className="w-4 h-4 mr-2" />
            View Detailed Stats
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
