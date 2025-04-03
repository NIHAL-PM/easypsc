
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PremiumUpgrade from "./components/PremiumUpgrade";
import AdminPanel from "./components/AdminPanel";
import { useEffect } from "react";
import { useToast } from "./components/ui/use-toast";
import { useAppStore } from "./lib/store";
import { getApiKey, saveApiKey } from "./services/api";

// User auth check component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize default API keys if they're not already set
    const initializeDefaultApiKeys = async () => {
      try {
        console.log('Initializing default API keys...');
        
        // Default API keys for development only
        const DEFAULT_API_KEYS = {
          GEMINI_API_KEY: 'AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik',
          NEWS_API_KEY: '7c64a4f4675a425ebe9fc4895fc6e273'
        };
        
        // Check if keys are already in localStorage or Supabase
        for (const [key, defaultValue] of Object.entries(DEFAULT_API_KEYS)) {
          // Try to get from localStorage or Supabase
          const existingValue = await getApiKey(key);
          
          if (!existingValue) {
            // Set default if not found
            await saveApiKey(key, defaultValue);
            console.log(`Set default ${key}`);
          }
        }
        
        console.log('API keys initialized');
      } catch (error) {
        console.error('Error initializing API keys:', error);
      }
    };
    
    initializeDefaultApiKeys();
    
    // Check if API key is properly configured
    const checkApiKeyConfigured = async () => {
      const apiKey = await getApiKey('GEMINI_API_KEY');
      if (!apiKey) {
        console.warn("Gemini API key not found. Questions may not load correctly.");
        // Only show toast if on non-admin page
        if (!window.location.pathname.includes('/admin')) {
          toast({
            title: "API Configuration Needed",
            description: "Please set up your Gemini API key in the Admin panel or enter it when prompted.",
            variant: "default",
          });
        }
      }
    };
    
    checkApiKeyConfigured();

    // Add event listener for responsive design testing
    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--viewport-width", 
        `${window.innerWidth}px`
      );
    };
    
    // Initial call and setup listener
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [toast]);

  return (
    <TooltipProvider>
      {/* Decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background to-background opacity-80"></div>
        <div className="absolute top-0 right-0 w-[30vw] h-[30vw] max-w-[500px] max-h-[500px] bg-gradient-primary opacity-[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-gradient-secondary opacity-[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-[25vw] h-[25vw] max-w-[400px] max-h-[400px] bg-gradient-accent animate-float opacity-[0.03] rounded-full blur-3xl"></div>
      </div>
      
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/premium" element={<PremiumUpgrade />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
