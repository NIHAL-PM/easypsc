
import { useState } from "react";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Language } from "@/types";
import { useAppStore } from "@/lib/store";

interface LanguageSelectorProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

const LanguageSelector = ({ 
  variant = "outline", 
  size = "default" 
}: LanguageSelectorProps) => {
  const { selectedLanguage, setSelectedLanguage } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages: Record<Language, string> = {
    "English": "English",
    "Hindi": "हिंदी",
    "Tamil": "தமிழ்",
    "Telugu": "తెలుగు",
    "Malayalam": "മലയാളം"
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="gap-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <Languages className="h-4 w-4 text-indigo-400" />
          <span className="text-indigo-50 font-medium">{languages[selectedLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/40 shadow-lg rounded-xl w-36 p-1 animate-in fade-in-80 zoom-in-95"
      >
        {Object.entries(languages).map(([key, label]) => (
          <DropdownMenuItem 
            key={key}
            onClick={() => handleLanguageSelect(key as Language)}
            className={`rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors flex justify-between items-center ${
              selectedLanguage === key 
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" 
                : "hover:bg-gray-100 dark:hover:bg-slate-800/70"
            }`}
          >
            <span>{label}</span>
            {selectedLanguage === key && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-indigo-500"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
