
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateQuestions } from '@/services/api';
import { useAppStore } from '@/lib/store';
import { ExamType, QuestionDifficulty, Subject } from '@/types';
import { Loader2, Timer, AlertTriangle } from 'lucide-react';
import DifficultySelector from './DifficultySelector';
import LoadingSpinner from './LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const QuestionGenerator = ({ 
  examType = 'UPSC' as ExamType
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('medium');
  const [selectedCount, setSelectedCount] = useState(5);
  const [canGenerate, setCanGenerate] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [mixedMode, setMixedMode] = useState(false);
  const [mixedSettings, setMixedSettings] = useState({
    easy: 2,
    medium: 5,
    hard: 3
  });
  
  const {
    user,
    setQuestions,
    setCurrentQuestion,
    nextQuestion,
    setIsLoading: setAppLoading,
    askedQuestionIds,
    questionsWithTimer,
    toggleQuestionsWithTimer,
    mixedDifficultySettings,
    setMixedDifficultySettings,
    setSelectedSubject: setGlobalSelectedSubject,
  } = useAppStore(state => state);

  // Use cooldown to prevent spamming
  const handleGenerateQuestions = async () => {
    if (isLoading || !user) return;
    
    // Check if the user can generate new questions
    if (user.lastQuestionTime) {
      const now = Date.now();
      const timeSinceLastQuestion = now - user.lastQuestionTime;
      
      // If less than 10 minutes (600,000 ms) have passed
      if (timeSinceLastQuestion < 600000) {
        const remainingCooldown = Math.ceil((600000 - timeSinceLastQuestion) / 1000);
        
        setCooldownSeconds(remainingCooldown);
        setCanGenerate(false);
        
        toast({
          title: "Please wait",
          description: `You can generate new questions in ${Math.ceil(remainingCooldown / 60)} minute(s).`,
          variant: "destructive"
        });
        
        // Start countdown
        const interval = setInterval(() => {
          setCooldownSeconds(prev => {
            const newValue = prev - 1;
            if (newValue <= 0) {
              clearInterval(interval);
              setCanGenerate(true);
              return 0;
            }
            return newValue;
          });
        }, 1000);
        
        return;
      }
    }
    
    // Check if the user has questions remaining
    if (!user.isPremium && user.monthlyQuestionsRemaining <= 0) {
      toast({
        title: "Question limit reached",
        description: "You've reached your monthly question limit. Upgrade to premium for unlimited questions.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setAppLoading(true);
    
    try {
      let generatedQuestions;
      
      // Store subject selection in global state
      setGlobalSelectedSubject(selectedSubject);
      
      if (mixedMode) {
        // Update global mixed difficulty settings
        setMixedDifficultySettings(mixedSettings);
        
        // Generate questions with mixed difficulty
        const easyQuestions = await generateQuestions({
          examType: user.examType,
          difficulty: 'easy',
          count: mixedSettings.easy,
          askedQuestionIds,
          subject: selectedSubject
        });
        
        const mediumQuestions = await generateQuestions({
          examType: user.examType,
          difficulty: 'medium',
          count: mixedSettings.medium,
          askedQuestionIds: [...askedQuestionIds, ...easyQuestions.map(q => q.id)],
          subject: selectedSubject
        });
        
        const hardQuestions = await generateQuestions({
          examType: user.examType,
          difficulty: 'hard',
          count: mixedSettings.hard,
          askedQuestionIds: [...askedQuestionIds, ...easyQuestions.map(q => q.id), ...mediumQuestions.map(q => q.id)],
          subject: selectedSubject
        });
        
        generatedQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      } else {
        // Generate questions with single difficulty
        generatedQuestions = await generateQuestions({
          examType: user.examType, 
          difficulty: selectedDifficulty,
          count: selectedCount,
          askedQuestionIds,
          subject: selectedSubject
        });
      }
      
      if (generatedQuestions.length === 0) {
        toast({
          title: "No new questions",
          description: "We couldn't generate new unique questions. Try a different difficulty or exam type.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the lastQuestionTime
      useAppStore.getState().setLastQuestionTime(Date.now());
      
      setQuestions(generatedQuestions);
      
      // Set the first question
      if (generatedQuestions.length > 0) {
        setCurrentQuestion(generatedQuestions[0]);
      }
      
      toast({
        title: "Questions ready!",
        description: `Generated ${generatedQuestions.length} ${selectedDifficulty} questions.`,
      });
      
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please check your API key settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setAppLoading(false);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Generate Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        {/* Toggle between Mixed and Single Difficulty */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button 
              variant={mixedMode ? "outline" : "default"} 
              size="sm" 
              onClick={() => setMixedMode(false)}
              className="flex-1"
            >
              Single Difficulty
            </Button>
            <Button 
              variant={mixedMode ? "default" : "outline"} 
              size="sm" 
              onClick={() => setMixedMode(true)}
              className="flex-1"
            >
              Mixed Difficulties
            </Button>
          </div>
        </div>
        
        {/* Question Difficulty Selection */}
        {!mixedMode ? (
          <>
            <DifficultySelector 
              selected={selectedDifficulty} 
              onSelect={setSelectedDifficulty} 
            />
            
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCount(Math.max(1, selectedCount - 1))}
                >
                  -
                </Button>
                <div className="w-14 text-center font-medium">{selectedCount}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCount(Math.min(20, selectedCount + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Mixed difficulty settings
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>Easy Questions: {mixedSettings.easy}</Label>
              </div>
              <Slider
                value={[mixedSettings.easy]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => setMixedSettings({...mixedSettings, easy: value[0]})}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>Medium Questions: {mixedSettings.medium}</Label>
              </div>
              <Slider
                value={[mixedSettings.medium]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => setMixedSettings({...mixedSettings, medium: value[0]})}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>Hard Questions: {mixedSettings.hard}</Label>
              </div>
              <Slider
                value={[mixedSettings.hard]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => setMixedSettings({...mixedSettings, hard: value[0]})}
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              Total: {mixedSettings.easy + mixedSettings.medium + mixedSettings.hard} questions
            </div>
          </div>
        )}
        
        {/* Subject Selection */}
        <div className="space-y-2">
          <Label htmlFor="subject">Select Subject (Optional)</Label>
          <Select
            value={selectedSubject || ""}
            onValueChange={(value: Subject | "") => {
              if (value === "") {
                setSelectedSubject(null);
              } else {
                setSelectedSubject(value as Subject);
              }
            }}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              <SelectItem value="Polity">Polity</SelectItem>
              <SelectItem value="Economics">Economics</SelectItem>
              <SelectItem value="Art & Culture">Art & Culture</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Geography">Geography</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Environment">Environment</SelectItem>
              <SelectItem value="Current Affairs">Current Affairs</SelectItem>
              <SelectItem value="English Language">English Language</SelectItem>
              <SelectItem value="General Knowledge">General Knowledge</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Timer Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="timer-toggle" className="text-sm">Enable Timer</Label>
          </div>
          <Button 
            variant={questionsWithTimer ? "default" : "outline"} 
            size="sm" 
            onClick={toggleQuestionsWithTimer}
            className="ml-auto"
          >
            {questionsWithTimer ? "On" : "Off"}
          </Button>
        </div>
        
        {!user?.isPremium && (
          <div className="flex items-center text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
            {user?.monthlyQuestionsRemaining} questions remaining this month
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateQuestions} 
          disabled={isLoading || !canGenerate || !user || (!user.isPremium && user.monthlyQuestionsRemaining <= 0)}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-2" /> Generating...
            </>
          ) : canGenerate ? (
            "Generate Questions"
          ) : (
            `Wait ${formatTime(cooldownSeconds)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionGenerator;
