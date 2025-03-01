
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { CrownIcon, LineChart } from 'lucide-react';

const ProfileCard = () => {
  const { user, getUserStats } = useAppStore();
  
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
      <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm neo-morphism">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback className="bg-accent text-lg">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{user.examType} Aspirant</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{user.questionsAnswered} questions</span>
            </div>
            <Progress value={Math.min(user.questionsAnswered, 100)} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-3xl font-bold">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-3xl font-bold">{stats.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
          </div>
          
          {!user.isPremium && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
              <div className="flex items-start gap-3">
                <CrownIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Free Plan</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    You have <span className="font-semibold">{questionsRemaining}</span> questions remaining this month.
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-white dark:bg-black text-xs border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950">
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" size="sm">
            <LineChart className="w-4 h-4 mr-2" />
            View Detailed Stats
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
