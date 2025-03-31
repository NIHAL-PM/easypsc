
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionDifficulty } from '@/types';

export interface DifficultySelectorProps {
  selected: QuestionDifficulty;
  onSelect: (value: QuestionDifficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onSelect }) => {
  return (
    <Tabs value={selected} onValueChange={(value) => onSelect(value as QuestionDifficulty)}>
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="easy" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900/20 dark:data-[state=active]:text-green-400">
          Easy
        </TabsTrigger>
        <TabsTrigger value="medium" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-900/20 dark:data-[state=active]:text-amber-400">
          Medium
        </TabsTrigger>
        <TabsTrigger value="hard" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-800 dark:data-[state=active]:bg-rose-900/20 dark:data-[state=active]:text-rose-400">
          Hard
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default DifficultySelector;
