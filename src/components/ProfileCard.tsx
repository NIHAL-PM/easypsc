
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, Award, XCircle, BarChart4, User, Calendar } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ExamType } from '@/types';
import { motion } from 'framer-motion';
import { safeObjectEntries } from '@/lib/utils';

const ProfileCard = () => {
  const { user, getUserStats, changeExamType } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // If no user, return empty card
  if (!user) {
    return <div></div>;
  }
  
  const stats = getUserStats();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="text-xl flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <User className="w-5 h-5 text-indigo-500" />
              Profile
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-indigo-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium">Exam Focus</p>
                <Select 
                  value={user.examType} 
                  onValueChange={(value: ExamType) => changeExamType(value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select exam"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPSC">UPSC</SelectItem>
                    <SelectItem value="PSC">PSC</SelectItem>
                    <SelectItem value="SSC">SSC</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                {user.isPremium ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-300 text-white">
                    <Award className="w-3 h-3 mr-1" /> Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    Free
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 text-center">
              <div className="flex-1 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{stats.totalQuestions}</div>
                <div className="text-xs text-indigo-800 dark:text-indigo-300">Questions</div>
              </div>
              <div className="flex-1 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{stats.correctAnswers}</div>
                <div className="text-xs text-emerald-800 dark:text-emerald-300">Correct</div>
              </div>
              <div className="flex-1 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.streakDays}</div>
                <div className="text-xs text-amber-800 dark:text-amber-300">Day Streak</div>
              </div>
            </div>
            
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <BarChart4 className="h-4 w-4 text-indigo-500" />
                      <Label className="font-medium">Accuracy</Label>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, stats.accuracyPercentage)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right text-muted-foreground">
                      {stats.accuracyPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <Label className="font-medium text-sm">Strong Areas</Label>
                    </div>
                    <ul className="space-y-1">
                      {stats.strongCategories.length > 0 ? stats.strongCategories.map((category, i) => (
                        <li key={i} className="text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded">
                          {category}
                        </li>
                      )) : (
                        <li className="text-xs text-muted-foreground">Keep practicing!</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-rose-500" />
                      <Label className="font-medium text-sm">Weak Areas</Label>
                    </div>
                    <ul className="space-y-1">
                      {stats.weakCategories.length > 0 ? stats.weakCategories.map((category, i) => (
                        <li key={i} className="text-xs px-2 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded">
                          {category}
                        </li>
                      )) : (
                        <li className="text-xs text-muted-foreground">Great job!</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 pt-1">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs text-muted-foreground">
                    Questions remaining this month: 
                    <span className="font-semibold text-foreground ml-1">
                      {user.isPremium ? 'Unlimited' : user.monthlyQuestionsRemaining}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
