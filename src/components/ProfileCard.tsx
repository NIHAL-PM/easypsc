
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Crown, LineChart, ArrowRight, Award, BarChart3, User, Rocket, Sparkles, PersonStanding, Brain } from 'lucide-react';
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
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse-subtle blur-sm opacity-80"></div>
              <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-800 relative">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.isPremium && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-300 p-1 rounded-full shadow-lg">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <PersonStanding className="w-3 h-3 text-indigo-500" />
                <span>{user.examType} Aspirant</span>
                {user.isPremium && (
                  <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-amber-400 to-yellow-300 text-white">
                    <Crown className="w-3 h-3 mr-0.5" /> PREMIUM
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Brain className="w-3 h-3 text-indigo-500" />
                Progress
              </span>
              <span className="font-medium text-indigo-700 dark:text-indigo-300">{user.questionsAnswered} questions</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(user.questionsAnswered, 100)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-950/30 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{accuracy}%</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                  <Award className="w-4 h-4" /> Accuracy
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-950/30 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.correctAnswers}</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" /> Correct
                </div>
              </div>
            </div>
          </div>
          
          {!user.isPremium && (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-300 text-white flex-shrink-0 shadow-md">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Free Plan
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                    You have <span className="font-semibold">{questionsRemaining}</span> questions remaining this month.
                  </p>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full text-xs shadow-sm btn-modern bg-gradient-to-r from-amber-500 to-yellow-500"
                    onClick={() => navigate("/premium")}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
            size="sm"
          >
            <LineChart className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
            View Detailed Stats
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
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
