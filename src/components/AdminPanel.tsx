import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, KeyRound, Users, MessageSquare, BarChart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ApiKeyManager from './ApiKeyManager';
import { getSystemStats } from '@/services/api';
import { useAppStore } from '@/lib/store';

const AdminPanel = () => {
  const { user } = useAppStore();
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && !user.isPremium) {
      toast({
        title: "Admin Access",
        description: "You must be a premium user to access the admin panel.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  if (!user || !user.isPremium) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Admin Access Denied
            </CardTitle>
            <CardDescription>
              You must be a premium user to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            Please upgrade to a premium account to access admin features.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
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
        </TabsList>
        <TabsContent value="system" className="space-y-4">
          <SystemStats />
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <ApiKeyManager onApiKeyConfigured={setIsApiKeyConfigured} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Fix the incorrect Promise handling in the SystemStats component
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

export default AdminPanel;
