
import React from 'react';
import { QuestionDifficulty } from '@/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface DifficultySelectorProps {
  selected: QuestionDifficulty;
  onSelect: (value: QuestionDifficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Question Difficulty</div>
      <ToggleGroup 
        type="single" 
        value={selected} 
        onValueChange={(value) => value && onSelect(value as QuestionDifficulty)}
        className="justify-start"
      >
        <ToggleGroupItem value="easy" className="text-sm" aria-label="Easy difficulty">
          Easy
        </ToggleGroupItem>
        <ToggleGroupItem value="medium" className="text-sm" aria-label="Medium difficulty">
          Medium
        </ToggleGroupItem>
        <ToggleGroupItem value="hard" className="text-sm" aria-label="Hard difficulty">
          Hard
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default DifficultySelector;
