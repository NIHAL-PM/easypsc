
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { NewsItem, ExamType } from '@/types';
import { fetchNews, getCachedNews, cacheNews, shouldRefreshNews, forceRefreshNews, getTimeUntilNextRefresh } from '@/services/newsService';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, RefreshCw, Newspaper, Calendar, AlertTriangle, Clock, TrendingUp, Radio } from 'lucide-react';

const newsCategories = [
  'All',
  'Politics',
  'Economy',
  'Science & Technology',
  'Environment',
  'International Relations',
  'Sports',
  'Health',
  'General'
];

const CurrentAffairs = () => {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 5;
  
  // Load news on component mount and set up refresh timer
  useEffect(() => {
    loadNews();
    
    // Set up auto-refresh every 3 minutes
    const refreshInterval = setInterval(() => {
      // Only auto-refresh if the tab/browser is active
      if (!document.hidden && shouldRefreshNews()) {
        console.log('Auto-refreshing news...');
        loadNews(false); // silent refresh
      }
    }, 30 * 1000); // Check every 30 seconds
    
    // Update the countdown timer
    const countdownInterval = setInterval(() => {
      setTimeUntilNextRefresh(getTimeUntilNextRefresh());
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [user]);
  
  // Filter news when category or page changes
  useEffect(() => {
    filterNews();
  }, [news, selectedCategory, currentPage]);
  
  const loadNews = async (showToast = true) => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      // Fetch fresh news
      const fetchedNews = await fetchNews(user?.examType);
      
      if (fetchedNews.length === 0) {
        if (showToast) {
          toast({
            title: 'No news available',
            description: 'Unable to fetch news. Please try again later.',
            variant: 'destructive',
          });
        }
        // Try to use cached news as fallback
        const cachedNews = getCachedNews(user?.examType);
        if (cachedNews.length > 0) {
          setNews(cachedNews);
        }
      } else {
        setNews(fetchedNews);
        
        if (showToast) {
          toast({
            title: 'News updated',
            description: `Loaded ${fetchedNews.length} current affairs items`,
          });
        }
      }
    } catch (error) {
      console.error('Error loading news:', error);
      
      if (showToast) {
        toast({
          title: 'Failed to fetch news',
          description: 'Using cached news. Please check your connection.',
          variant: 'destructive',
        });
      }
      
      // Try to use cached news as fallback
      const cachedNews = getCachedNews(user?.examType);
      if (cachedNews.length > 0) {
        setNews(cachedNews);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setTimeUntilNextRefresh(getTimeUntilNextRefresh());
    }
  };
  
  const filterNews = () => {
    let filtered = [...news];
    
    // Filter by category if not 'All'
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    setFilteredNews(filtered.slice(startIndex, endIndex));
  };
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    toast({
      title: 'Refreshing news',
      description: 'Fetching the latest current affairs...'
    });
    
    setIsRefreshing(true);
    
    try {
      const freshNews = await forceRefreshNews(user?.examType);
      setNews(freshNews);
      
      toast({
        title: 'News refreshed',
        description: `Loaded ${freshNews.length} current affairs items`,
      });
    } catch (error) {
      toast({
        title: 'Failed to refresh news',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when changing category
  };
  
  const totalFilteredItems = selectedCategory === 'All' 
    ? news.length 
    : news.filter(item => item.category === selectedCategory).length;
  
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  
  // Format the time until next refresh
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeUntilNextRefresh / 60);
    const seconds = timeUntilNextRefresh % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <Card className="glassmorphism-dark border-0 shadow-lg overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/70 backdrop-blur-md">
      <CardHeader className="border-b border-slate-700/60 pb-3 bg-gradient-to-r from-slate-800/90 to-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-slate-50 text-xl font-semibold">Current Affairs</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>Next refresh in: {formatTimeRemaining()}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="h-8 gap-1 btn-fancy bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-600"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
        <CardDescription className="text-slate-400">
          Latest news and current affairs relevant for {user?.examType || 'competitive'} exam preparation
          <div className="mt-1 text-xs flex items-center">
            <Radio className="h-3 w-3 mr-1 text-emerald-500" />
            <span className="text-emerald-400">Live updates every 3 minutes</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <Tabs 
        defaultValue="All" 
        value={selectedCategory} 
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <div className="px-4 pt-2 overflow-auto bg-slate-800/40">
          <TabsList className="w-full flex overflow-x-auto hide-scrollbar p-1 bg-slate-900/50">
            {newsCategories.map((category) => (
              <TabsTrigger 
                key={category}
                value={category}
                className="whitespace-nowrap data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <ScrollArea className="h-[460px] px-4 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-12 w-12 text-emerald-500 animate-spin" />
                <p className="text-sm text-slate-400 mt-2">Loading current affairs...</p>
              </div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 gap-4">
              <AlertTriangle className="h-16 w-16 text-amber-500/70" />
              <div className="text-center">
                <p className="text-lg font-medium text-slate-300">No current affairs found</p>
                <p className="text-sm text-slate-400 mb-4">Try selecting a different category or refreshing the news</p>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-amber-600/20 text-amber-400 border-amber-700/50 hover:bg-amber-600/40">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh News
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {filteredNews.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/70 transition-all">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {item.imageUrl && (
                          <div className="relative w-full sm:w-1/3 h-40 sm:h-auto overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="object-cover w-full h-full transition-transform hover:scale-105 duration-700" 
                              onError={(e) => {
                                // If image fails to load, hide it
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-700/30">
                              {item.category}
                            </Badge>
                            <div className="flex items-center text-xs text-slate-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2 text-slate-200">{item.title}</h3>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Source: {item.source}
                            </span>
                            <Button variant="ghost" size="sm" className="gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30" asChild>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <span>Read more</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-700/30 text-xs flex items-center text-slate-500">
                            <TrendingUp className="h-3 w-3 mr-1 text-amber-500" />
                            <span>Relevant for: {item.relevantForExams.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
        
        {totalPages > 1 && (
          <CardFooter className="border-t border-slate-700/40 p-2 bg-slate-800/80">
            <Pagination className="w-full">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : 0}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Show pagination based on current page for many pages
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : 0}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Tabs>
    </Card>
  );
};

export default CurrentAffairs;
