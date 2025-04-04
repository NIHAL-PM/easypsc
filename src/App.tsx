
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "./components/ui/use-toast";
import { useAppStore } from "./lib/store";
import { getApiKey } from "./services/api";
import { initializeDefaultApiKeys } from "./lib/api-key";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { getUserFromFirebase } from "./lib/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PremiumUpgrade from "./components/PremiumUpgrade";
import AdminPanel from "./components/AdminPanel";

// Check if admin is authenticated
const isAdminAuthenticated = () => {
  const authStatus = localStorage.getItem('isAdminAuthenticated');
  const authTime = parseInt(localStorage.getItem('adminAuthTime') || '0', 10);
  const now = new Date().getTime();
  const hoursPassed = (now - authTime) / (1000 * 60 * 60);
  
  // Admin session expires after 2 hours
  if (hoursPassed > 2) {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminAuthTime');
    return false;
  }
  
  return authStatus === 'true';
};

// Admin route protection
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

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
  const { setUser, setIsLoading, setAuthenticated } = useAppStore();
  
  useEffect(() => {
    // Initialize default API keys
    const setupApiKeys = async () => {
      try {
        await initializeDefaultApiKeys();
        
        // Check if API key is properly configured
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
        } else {
          console.log("API keys initialized successfully");
        }
      } catch (error) {
        console.error('Error setting up API keys:', error);
      }
    };
    
    setupApiKeys();

    // Set up Firebase auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          const user = await getUserFromFirebase(firebaseUser);
          setUser(user);
          setAuthenticated(true);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
          setAuthenticated(false);
        }
      } else {
        setUser(null);
        setAuthenticated(false);
      }
      
      setIsLoading(false);
    });

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
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [setUser, setIsLoading, setAuthenticated, toast]);

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
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
