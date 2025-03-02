
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PremiumUpgrade from "./components/PremiumUpgrade";
import AdminPanel from "./components/AdminPanel";
import { useEffect } from "react";
import { useToast } from "./components/ui/use-toast";
import { useAppStore } from "./lib/store";

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

// User auth check component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

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
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
