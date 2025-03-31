
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';

const QuestionHistory = () => {
  const { user } = useAppStore();
  
  if (!user || !user.questionHistory || user.questionHistory.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Question History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            You haven't answered any questions yet. Start practicing to see your history.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Sort history by date descending (newest first)
  const sortedHistory = [...user.questionHistory].sort((a, b) => b.date - a.date);
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Question History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sortedHistory.map((item, index) => {
            const question = useAppStore.getState().questions.find(q => q.id === item.questionId);
            if (!question) return null;
            
            return (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      {item.isCorrect ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-0">
                          <Check className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-0">
                          <X className="w-3 h-3 mr-1" />
                          Incorrect
                        </Badge>
                      )}
                      <span className="text-sm font-medium truncate max-w-xs">
                        {question.text.length > 60 ? `${question.text.substring(0, 60)}...` : question.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {Math.floor(item.timeSpent / 60)}:{(item.timeSpent % 60).toString().padStart(2, '0')}
                      <span>{format(new Date(item.date), 'MMM d')}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 space-y-3">
                    <p className="text-sm">{question.text}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`p-3 text-sm rounded-lg border ${
                            optIndex === question.correctOption
                              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800'
                              : optIndex === item.selectedOption && optIndex !== question.correctOption
                              ? 'bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:border-rose-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium">
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span>{option}</span>
                            {optIndex === question.correctOption && (
                              <Check className="ml-auto text-emerald-500 w-4 h-4" />
                            )}
                            {optIndex === item.selectedOption && optIndex !== question.correctOption && (
                              <X className="ml-auto text-rose-500 w-4 h-4" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-xs text-indigo-700 dark:text-indigo-400">{question.explanation}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default QuestionHistory;
