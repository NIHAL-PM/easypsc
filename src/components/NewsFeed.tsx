
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getNewsArticles } from '@/services/api';
import { Newspaper, RefreshCw, ExternalLink, Calendar } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const NewsCategories = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
];

const NewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [error, setError] = useState<string | null>(null);
  
  const loadNews = async (category: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newsArticles = await getNewsArticles(category);
      setArticles(newsArticles);
    } catch (err) {
      console.error('Failed to load news:', err);
      setError('Failed to load news articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadNews(activeCategory);
  }, [activeCategory]);
  
  const handleRefresh = () => {
    loadNews(activeCategory);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="border shadow-md h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>Latest News</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Stay updated with the latest news for your exam preparation
        </CardDescription>
      </CardHeader>
      
      <div className="px-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start mb-4">
              {NewsCategories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          {NewsCategories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="m-0">
              <ScrollArea className="h-[440px]">
                {isLoading ? (
                  <div className="space-y-4 px-1">
                    {[1, 2, 3, 4].map((n) => (
                      <Card key={n} className="overflow-hidden">
                        <div className="space-y-3 p-4">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex items-center gap-2 pt-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>{error}</p>
                    <Button variant="link" onClick={handleRefresh} className="mt-2">
                      Try again
                    </Button>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>No news articles available</p>
                    <Button variant="link" onClick={handleRefresh} className="mt-2">
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 px-1">
                    {articles.map((article, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-base font-medium hover:text-primary transition-colors"
                              >
                                {article.title}
                              </a>
                            </div>
                            
                            {article.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {article.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {article.source.name}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(article.publishedAt)}</span>
                                </div>
                              </div>
                              
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                <span>Read more</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
};

export default NewsFeed;
