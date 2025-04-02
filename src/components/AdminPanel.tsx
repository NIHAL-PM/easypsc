import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, KeyRound, Users, MessageSquare, BarChart, LockIcon, Settings, Newspaper } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ApiKeyManager from './ApiKeyManager';
import { getSystemStats } from '@/services/api';
import { useAppStore } from '@/lib/store';
import { supabase } from "@/integrations/supabase/client";
import { initializeDefaultApiKeys } from '@/lib/api-key';

const AdminPanel = () => {
  const { user } = useAppStore();
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      // Special case: hardcoded admin credentials
      if (localStorage.getItem('isAdminAuthenticated') === 'true') {
        setIsAdminUser(true);
        return;
      }
      
      // No further checks if user is not logged in
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .rpc('is_admin', { user_id: user.id });
          
        if (error) {
          console.error('Error checking admin status:', error);
          return;
        }
        
        setIsAdminUser(!!data);
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    // Initialize default API keys when the admin panel is loaded
    const setupApiKeys = async () => {
      if (isAdminUser) {
        await initializeDefaultApiKeys();
      }
    };

    setupApiKeys();
  }, [isAdminUser]);

  const handleAdminLogin = () => {
    // Hardcoded admin credentials for demonstration
    if (adminCredentials.username === 'bluewaterbottle' && 
        adminCredentials.password === 'waterbottle') {
      setIsAdminUser(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      toast({
        title: "Admin Access Granted",
        description: "You have successfully logged in as admin.",
        variant: "default",
      });
    } else {
      toast({
        title: "Invalid Credentials",
        description: "The username or password you entered is incorrect.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAdminUser(false);
    localStorage.removeItem('isAdminAuthenticated');
  };

  if (!isAdminUser) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockIcon className="h-5 w-5" />
              Admin Access
            </CardTitle>
            <CardDescription>
              Please login with admin credentials to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter admin username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter admin password"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleAdminLogin}
            >
              Login as Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      
      <Tabs defaultValue="system" className="w-full max-w-4xl mx-auto space-y-4">
        <TabsList>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            System Stats
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Content Management
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            News Settings
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Site Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="space-y-4">
          <SystemStats />
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <ApiKeyManager onApiKeyConfigured={setIsApiKeyConfigured} />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        <TabsContent value="content" className="space-y-4">
          <ContentManagement />
        </TabsContent>
        <TabsContent value="news" className="space-y-4">
          <NewsSettings />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SystemStats = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    premiumUsers: number;
    activeToday: number;
    totalQuestionsAnswered: number;
    totalQuestionsCorrect: number;
    examTypeDistribution: Record<string, number>;
  }>({
    totalUsers: 0,
    premiumUsers: 0,
    activeToday: 0,
    totalQuestionsAnswered: 0,
    totalQuestionsCorrect: 0,
    examTypeDistribution: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const systemStats = await getSystemStats();
        setStats(systemStats);
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(async () => {
      try {
        const systemStats = await getSystemStats();
        setStats(systemStats);
      } catch (error) {
        console.error('Failed to update system stats:', error);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          System Statistics
        </CardTitle>
        <CardDescription>
          Real-time statistics about the AI Exam Prep platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-4">Loading statistics...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-muted-foreground">Total Users</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="text-2xl font-bold">{stats.premiumUsers}</div>
                  <div className="text-muted-foreground">Premium Users</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="text-2xl font-bold">{stats.activeToday}</div>
                  <div className="text-muted-foreground">Active Users Today</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="text-2xl font-bold">{stats.totalQuestionsAnswered}</div>
                  <div className="text-muted-foreground">Total Questions Answered</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, preferred_language, created_at');
          
        if (error) {
          throw error;
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user accounts and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
              <div>User ID</div>
              <div>Name</div>
              <div>Language</div>
              <div>Joined</div>
            </div>
            <div className="divide-y">
              {users.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No users found</div>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} className="grid grid-cols-4 gap-4 p-4">
                    <div className="truncate">{user.id}</div>
                    <div>{user.full_name || 'Unnamed'}</div>
                    <div>{user.preferred_language || 'English'}</div>
                    <div>{new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ContentManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('questions')
          .select('id, question, difficulty_level, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          throw error;
        }
        
        setQuestions(data || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Content Management
        </CardTitle>
        <CardDescription>
          Manage exam questions and content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading content...</div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-3 gap-4 p-4 font-medium border-b">
              <div>Question</div>
              <div>Difficulty</div>
              <div>Created</div>
            </div>
            <div className="divide-y">
              {questions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No questions found</div>
              ) : (
                questions.map((question: any) => (
                  <div key={question.id} className="grid grid-cols-3 gap-4 p-4">
                    <div className="truncate">{question.question}</div>
                    <div>{question.difficulty_level || 'Medium'}</div>
                    <div>{new Date(question.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const NewsSettings = () => {
  const [categories, setCategories] = useState([
    { id: 'general', name: 'General' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'health', name: 'Health' },
    { id: 'science', name: 'Science' },
    { id: 'sports', name: 'Sports' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClearNewsCache = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('news-feed', {
        body: {
          action: 'clear-cache',
          category: selectedCategory
        }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to clear news cache. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "News cache cleared successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error clearing news cache:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News Feed Settings
        </CardTitle>
        <CardDescription>
          Manage news feed settings and cache
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newsCategory">News Category</Label>
          <select 
            id="newsCategory"
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <Button 
          onClick={handleClearNewsCache}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Clear News Cache"}
        </Button>
      </CardContent>
    </Card>
  );
};

const SiteSettings = () => {
  const [defaultLanguage, setDefaultLanguage] = useState('english');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const languages = [
    { id: 'english', name: 'English' },
    { id: 'hindi', name: 'Hindi' },
    { id: 'tamil', name: 'Tamil' },
    { id: 'telugu', name: 'Telugu' },
    { id: 'marathi', name: 'Marathi' },
    { id: 'bengali', name: 'Bengali' },
    { id: 'gujarati', name: 'Gujarati' },
    { id: 'kannada', name: 'Kannada' },
    { id: 'malayalam', name: 'Malayalam' },
    { id: 'punjabi', name: 'Punjabi' },
    { id: 'urdu', name: 'Urdu' }
  ];

  useEffect(() => {
    const getSettings = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('admin-settings', {
          body: {
            action: 'get',
            key: 'DEFAULT_LANGUAGE'
          }
        });
        
        if (!error && data?.value) {
          setDefaultLanguage(data.value);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    
    getSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase.functions.invoke('admin-settings', {
        body: {
          action: 'set',
          key: 'DEFAULT_LANGUAGE',
          value: defaultLanguage
        }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Settings saved successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Site Settings
        </CardTitle>
        <CardDescription>
          Configure global application settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultLanguage">Default Language</Label>
          <select 
            id="defaultLanguage"
            className="w-full p-2 border border-gray-300 rounded"
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Default language for new users and content
          </p>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
