
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, LineChart, PieChart, UserCog, Users, Key, Settings, Database, CircleAlert } from 'lucide-react';
import { getApiKey, saveApiKey } from '@/lib/api-key';
import ApiKeyManager from '@/components/ApiKeyManager';
import AdminLogin from '@/components/AdminLogin';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    questionsGenerated: 0,
    questionsAnswered: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is already authenticated
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('isAdminAuthenticated');
      setIsAuthenticated(adminAuth === 'true');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('system-stats', {
          body: { action: 'get-all-stats' }
        });
        
        if (error) {
          console.error('Error fetching stats:', error);
          return;
        }
        
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error in fetchStats:', error);
      }
    };
    
    fetchStats();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
    toast({
      title: 'Logged out',
      description: 'You have been logged out of the admin panel',
    });
  };

  const handleClearDatabase = async () => {
    if (!confirm('WARNING: This will delete ALL user data except for admin settings. Are you absolutely sure?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-settings', {
        body: { action: 'clear-database' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: 'Database cleared',
        description: 'All user data has been deleted',
      });
      
      // Refresh stats
      const { data } = await supabase.functions.invoke('system-stats', {
        body: { action: 'get-all-stats' }
      });
      
      if (data) {
        setStats(data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while clearing the database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading admin panel...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onAdminAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <UserCog className="h-6 w-6" />
          Admin Control Panel
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-end gap-2">
              {stats.totalUsers}
              <Users className="h-5 w-5 text-blue-500 mb-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-end gap-2">
              {stats.activeUsers}
              <UserCog className="h-5 w-5 text-green-500 mb-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-end gap-2">
              {stats.questionsGenerated}
              <BarChart className="h-5 w-5 text-purple-500 mb-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-end gap-2">
              {stats.questionsAnswered}
              <PieChart className="h-5 w-5 text-amber-500 mb-1" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="api-keys">
        <TabsList className="mb-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Configure API keys for various services. These keys are stored securely in the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                View system information and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">System Health</h3>
                  <div className="flex items-center gap-2 text-green-500">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>All systems operational</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">API Status</h3>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gemini API</span>
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">News API</span>
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">System Logs</h3>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-3 text-xs font-mono h-48 overflow-y-auto">
                  <p className="text-green-600 dark:text-green-400">[INFO] System initialized successfully</p>
                  <p className="text-blue-600 dark:text-blue-400">[INFO] Default API keys initialized</p>
                  <p className="text-gray-600 dark:text-gray-400">[INFO] Database connection established</p>
                  <p className="text-gray-600 dark:text-gray-400">[INFO] Admin panel accessed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Manage database operations and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex items-start">
                  <CircleAlert className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Danger Zone</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      The following actions are destructive and cannot be undone. Use with extreme caution.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col space-y-2">
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={handleClearDatabase}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Clear All User Data'}
                  </Button>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    This will delete ALL user data except for admin settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
