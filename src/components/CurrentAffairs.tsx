
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { NewsItem, ExamType } from '@/types';
import { fetchNews, getCachedNews, cacheNews, shouldRefreshNews } from '@/services/newsService';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, Newspaper, Calendar, AlertTriangle } from 'lucide-react';

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
  const itemsPerPage = 5;
  
  // Load news on component mount
  useEffect(() => {
    loadNews();
    
    // Set up auto-refresh every 3 minutes
    const refreshInterval = setInterval(() => {
      if (shouldRefreshNews()) {
        console.log('Auto-refreshing news...');
        loadNews();
      }
    }, 3 * 60 * 1000); // 3 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user]);
  
  // Filter news when category or page changes
  useEffect(() => {
    filterNews();
  }, [news, selectedCategory, currentPage]);
  
  const loadNews = async () => {
    setIsLoading(true);
    
    try {
      // Always fetch fresh news for better user experience
      const fetchedNews = await fetchNews(user?.examType);
      setNews(fetchedNews);
      
      // Cache the fetched news
      cacheNews(fetchedNews);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading news:', error);
      
      // Try to use cached news as fallback
      const cachedNews = getCachedNews(user?.examType);
      if (cachedNews.length > 0) {
        setNews(cachedNews);
      }
      
      toast({
        title: 'Failed to fetch latest news',
        description: 'Using cached news instead. Please check your connection.',
        variant: 'destructive',
      });
      
      setIsLoading(false);
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
  
  const handleRefresh = () => {
    loadNews();
    toast({
      title: 'Refreshing news',
      description: 'Fetching the latest current affairs...'
    });
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when changing category
  };
  
  const totalPages = Math.ceil((selectedCategory === 'All' ? news.length : 
    news.filter(item => item.category === selectedCategory).length) / itemsPerPage);
  
  return (
    <Card className="glassmorphism border-0 shadow-lg">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>Current Affairs</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="h-8 gap-1 btn-fancy"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        <CardDescription>
          Latest news and current affairs relevant for {user?.examType || 'competitive'} exam preparation
          <div className="mt-1 text-xs">Auto-refreshes every 3 minutes</div>
        </CardDescription>
      </CardHeader>
      
      <Tabs 
        defaultValue="All" 
        value={selectedCategory} 
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <div className="px-4 pt-2 overflow-auto">
          <TabsList className="w-full flex overflow-x-auto hide-scrollbar p-1">
            {newsCategories.map((category) => (
              <TabsTrigger 
                key={category}
                value={category}
                className="whitespace-nowrap"
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
                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Loading current affairs...</p>
              </div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 gap-2">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No current affairs found for this category.</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Refresh News
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {item.imageUrl && (
                        <div className="relative w-full sm:w-1/3 h-40 sm:h-auto">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="object-cover w-full h-full" 
                            onError={(e) => {
                              // If image fails to load, hide it
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Source: {item.source}
                          </span>
                          <Button variant="ghost" size="sm" className="gap-1" asChild>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <span>Read more</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {totalPages > 1 && (
          <CardFooter className="border-t p-2">
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
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
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
