
import { Languages } from "lucide-react";
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
  
  const languages: Record<Language, string> = {
    "English": "English",
    "Hindi": "हिंदी",
    "Tamil": "தமிழ்",
    "Telugu": "తెలుగు",
    "Malayalam": "മലയാളം"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Languages className="h-4 w-4" />
          <span>{languages[selectedLanguage]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([key, label]) => (
          <DropdownMenuItem 
            key={key}
            onClick={() => setSelectedLanguage(key as Language)}
            className={selectedLanguage === key ? "bg-accent text-accent-foreground" : ""}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
