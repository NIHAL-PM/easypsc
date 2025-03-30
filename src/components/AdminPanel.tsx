import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { 
  Loader2Icon, 
  DatabaseIcon, 
  UserIcon, 
  BarChart2Icon, 
  ArrowLeftIcon,
  KeyIcon,
  ShieldIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getGeminiApiKey } from '@/lib/env';

const AdminPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  
  useEffect(() => {
    // Load API key from localStorage or environment variable
    const storedApiKey = localStorage.getItem('GEMINI_API_KEY');
    const envApiKey = getGeminiApiKey();
    
    if (storedApiKey) {
      setGeminiApiKey(storedApiKey);
    } else if (envApiKey) {
      setGeminiApiKey(envApiKey);
    }
  }, []);
  
  const handleLogin = () => {
    setIsLoading(true);
    
    // Updated credentials to match requested values
    setTimeout(() => {
      if (username === 'bluewaterbottle' && password === 'waterbottle') {
        setIsLoggedIn(true);
        toast({
          title: 'Login successful',
          description: 'Welcome to the admin panel',
        });
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid username or password',
          variant: 'destructive'
        });
      }
      setIsLoading(false);
    }, 1500);
  };
  
  const handleUpdateApiKey = () => {
    setIsLoading(true);
    
    // Store API key in localStorage for persistence
    localStorage.setItem('GEMINI_API_KEY', geminiApiKey);
    
    // Simulate updating API key
    setTimeout(() => {
      toast({
        title: 'API key updated',
        description: 'Gemini API key has been updated successfully',
      });
      setIsLoading(false);
    }, 1000);
  };
  
  const handleUpdateModel = (value: string) => {
    setAiModel(value);
    
    toast({
      title: 'AI model updated',
      description: `AI model has been set to ${value}`,
    });
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };
  
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/40 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="overflow-hidden border-2 border-primary/10 shadow-lg bg-card/95 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-2 space-y-1">
              <div className="mx-auto mb-2 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                <ShieldIcon className="text-white h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Please enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter username"
                  className="border-input/60 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  className="border-input/60 focus:border-primary"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-gradient-to-r from-primary/90 to-primary shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>Login</>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full mt-2" 
                onClick={() => navigate('/')}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 p-4">
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/40 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <Card className="overflow-hidden border-2 border-primary/10 shadow-lg bg-card/95 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2 space-y-1">
                <div className="mx-auto mb-2 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                  <ShieldIcon className="text-white h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-center">Admin Login</CardTitle>
                <CardDescription className="text-center">
                  Please enter your credentials to access the admin panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter username"
                    className="border-input/60 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter password"
                    className="border-input/60 focus:border-primary"
                  />
                </div>
                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-gradient-to-r from-primary/90 to-primary shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>Login</>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full mt-2" 
                  onClick={() => navigate('/')}
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="apiSettings" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="apiSettings" className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4" />
                API Settings
              </TabsTrigger>
              <TabsTrigger value="userStats" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                User Statistics
              </TabsTrigger>
              <TabsTrigger value="systemStats" className="flex items-center gap-2">
                <BarChart2Icon className="h-4 w-4" />
                System Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="apiSettings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gemini API Configuration</CardTitle>
                  <CardDescription>
                    Update the API key and model settings for the Gemini API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Gemini API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="apiKey" 
                        value={geminiApiKey} 
                        onChange={(e) => setGeminiApiKey(e.target.value)} 
                        placeholder="Enter your Gemini API key"
                        className="flex-1 font-mono"
                        type="password"
                      />
                      <Button 
                        onClick={handleUpdateApiKey}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          'Update'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select 
                      defaultValue={aiModel} 
                      onValueChange={handleUpdateModel}
                    >
                      <SelectTrigger id="model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Usage</CardTitle>
                  <CardDescription>
                    Monitor your Gemini API usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">API Calls Today</p>
                      <p className="text-2xl font-bold mt-1">247</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">API Calls This Month</p>
                      <p className="text-2xl font-bold mt-1">5,731</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="text-2xl font-bold mt-1">$12.45</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="userStats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                  <CardDescription>
                    Overview of user activity and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold mt-1">127</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Premium Users</p>
                      <p className="text-2xl font-bold mt-1">43</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Active Today</p>
                      <p className="text-2xl font-bold mt-1">68</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Questions Answered</p>
                      <p className="text-2xl font-bold mt-1">2,145</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-medium mb-2">User Distribution by Exam Type</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>UPSC</span>
                          <span>45 users (35%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '35%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>PSC</span>
                          <span>32 users (25%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '25%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>SSC</span>
                          <span>28 users (22%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '22%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Banking</span>
                          <span>22 users (18%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '18%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="systemStats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                  <CardDescription>
                    Overview of system performance and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Server Uptime</p>
                      <p className="text-2xl font-bold mt-1">99.9%</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                      <p className="text-2xl font-bold mt-1">237ms</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                      <p className="text-2xl font-bold mt-1">4,389</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-medium mb-2">Database Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <DatabaseIcon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Database Size</p>
                          <p className="text-xs text-muted-foreground">248 MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <DatabaseIcon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Total Records</p>
                          <p className="text-xs text-muted-foreground">12,567 records</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <DatabaseIcon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Backup</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
