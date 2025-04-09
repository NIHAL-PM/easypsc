
import { useState } from "react";
import { Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  theme?: "light" | "dark" | "glass";
}

const LanguageSelector = ({ 
  variant = "outline", 
  size = "default",
  theme = "glass"
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

  const getButtonClass = () => {
    if (theme === "glass") {
      return "gap-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-sm";
    } else if (theme === "light") {
      return "gap-2 bg-white shadow-md hover:bg-gray-50 transition-all duration-300";
    } else {
      return "gap-2 bg-slate-800/90 border border-slate-700/50 hover:bg-slate-700/80 transition-all duration-300";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={getButtonClass()}
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Languages className="h-4 w-4 text-indigo-400" />
          </motion.div>
          <motion.span 
            className="text-indigo-50 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={selectedLanguage}
            transition={{ duration: 0.3 }}
          >
            {languages[selectedLanguage]}
          </motion.span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/40 shadow-lg rounded-xl w-36 p-1 animate-in fade-in-80 zoom-in-95"
      >
        <AnimatePresence>
          {Object.entries(languages).map(([key, label]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuItem 
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
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
