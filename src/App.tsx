
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PremiumUpgrade from "./components/PremiumUpgrade";
import AdminPanel from "./components/AdminPanel";
import { useEffect } from "react";
import { useToast } from "./components/ui/use-toast";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Check for API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const App = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Verify API key on app load
    if (!GEMINI_API_KEY) {
      console.warn("Gemini API key not found. Questions may not load correctly.");
      // Only show toast if on non-admin page
      if (!window.location.search.includes('admin=true')) {
        toast({
          title: "API Configuration Issue",
          description: "The Gemini API key may not be configured properly.",
          variant: "destructive",
        });
      }
    }

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
    </QueryClientProvider>
  );
};

export default App;
