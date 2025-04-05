
import { v4 as uuidv4 } from 'uuid';
import { ExamType, NewsItem } from '@/types';

// This could be replaced with an actual API key from a news service
// For now, we'll use a free API that doesn't require authentication
const NEWS_API_URL = 'https://saurav.tech/NewsAPI/';

interface ApiNewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const mapToExamTypes = (title: string, description: string): ExamType[] => {
  const content = (title + ' ' + description).toLowerCase();
  const examMappings = [
    { exam: 'UPSC' as ExamType, keywords: ['upsc', 'civil service', 'ias', 'ips', 'union public service'] },
    { exam: 'PSC' as ExamType, keywords: ['psc', 'public service', 'state service'] },
    { exam: 'SSC' as ExamType, keywords: ['ssc', 'staff selection', 'staff service'] },
    { exam: 'Banking' as ExamType, keywords: ['bank', 'rbi', 'reserve bank', 'finance', 'economy', 'banking'] }
  ];

  return examMappings
    .filter(mapping => mapping.keywords.some(keyword => content.includes(keyword)))
    .map(mapping => mapping.exam);
};

const guessCategory = (title: string, description: string): string => {
  const content = (title + ' ' + description).toLowerCase();
  
  const categoryMappings = [
    { category: 'Politics', keywords: ['politic', 'election', 'parliament', 'congress', 'government', 'minister'] },
    { category: 'Economy', keywords: ['econom', 'finance', 'market', 'stock', 'trade', 'gdp', 'inflation'] },
    { category: 'Science & Technology', keywords: ['tech', 'science', 'research', 'innovation', 'discovery'] },
    { category: 'Environment', keywords: ['environment', 'climate', 'pollution', 'sustainable', 'green'] },
    { category: 'International Relations', keywords: ['international', 'diplomacy', 'foreign', 'global', 'world'] },
    { category: 'Sports', keywords: ['sport', 'olympic', 'championship', 'tournament', 'athlete'] },
    { category: 'Health', keywords: ['health', 'medical', 'disease', 'hospital', 'doctor', 'patient'] }
  ];

  for (const mapping of categoryMappings) {
    if (mapping.keywords.some(keyword => content.includes(keyword))) {
      return mapping.category;
    }
  }
  
  return 'General';
};

const convertApiNewsToNewsItem = (item: ApiNewsItem): NewsItem => {
  const relevantExams = mapToExamTypes(item.title, item.description || '');
  const category = guessCategory(item.title, item.description || '');
  
  return {
    id: uuidv4(),
    title: item.title,
    description: item.description || 'No description available',
    url: item.url,
    source: item.source.name,
    publishedAt: item.publishedAt,
    imageUrl: item.urlToImage,
    category,
    relevantForExams: relevantExams.length ? relevantExams : ['UPSC', 'PSC', 'SSC', 'Banking']
  };
};

export const fetchNews = async (examType?: ExamType): Promise<NewsItem[]> => {
  try {
    // Use different categories to give varied news
    // This free API gives news from different sources and categories
    const endpoints = [
      `${NEWS_API_URL}/top-headlines/category/general/in.json`,
      `${NEWS_API_URL}/top-headlines/category/business/in.json`,
      `${NEWS_API_URL}/top-headlines/category/science/in.json`,
      `${NEWS_API_URL}/top-headlines/category/technology/in.json`
    ];
    
    const fetchPromises = endpoints.map(endpoint => 
      fetch(endpoint).then(res => res.json())
    );
    
    const results = await Promise.all(fetchPromises);
    let allNews: ApiNewsItem[] = [];
    
    results.forEach(result => {
      if (result.articles && Array.isArray(result.articles)) {
        allNews = [...allNews, ...result.articles];
      }
    });
    
    // Convert all news items to our format
    const newsItems = allNews.map(convertApiNewsToNewsItem);
    
    // If examType is provided, filter news relevant to that exam
    if (examType) {
      return newsItems.filter(item => 
        item.relevantForExams.includes(examType)
      );
    }
    
    return newsItems;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Store news in localStorage for caching
export const getCachedNews = (examType?: ExamType): NewsItem[] => {
  try {
    const cachedNews = localStorage.getItem('cached_news');
    if (!cachedNews) return [];
    
    const news: NewsItem[] = JSON.parse(cachedNews);
    
    // Check if the cache is from today
    const lastCached = localStorage.getItem('news_cached_at');
    if (lastCached) {
      const cachedDate = new Date(lastCached).toDateString();
      const today = new Date().toDateString();
      if (cachedDate !== today) {
        // Cache is old, don't use it
        return [];
      }
    }
    
    if (examType) {
      return news.filter(item => item.relevantForExams.includes(examType));
    }
    
    return news;
  } catch (error) {
    console.error('Error reading cached news:', error);
    return [];
  }
};

export const cacheNews = (news: NewsItem[]) => {
  try {
    localStorage.setItem('cached_news', JSON.stringify(news));
    localStorage.setItem('news_cached_at', new Date().toISOString());
  } catch (error) {
    console.error('Error caching news:', error);
  }
};
