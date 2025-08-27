
import { NewsItem, ExamType } from '@/types';

const NEWS_API_KEY = '1d38a275caa5db060f6c93be97421d28';
const NEWS_CACHE_KEY = 'cached_news_data';
const NEWS_CACHE_TIMESTAMP_KEY = 'news_cache_timestamp';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

// Fallback news data for when API fails
const fallbackNews: NewsItem[] = [
  {
    id: '1',
    title: 'Government Announces New Education Policy Reform',
    description: 'Major changes in higher education curriculum affecting competitive exams.',
    url: '#',
    source: 'Education Times',
    publishedAt: new Date().toISOString(),
    category: 'Education',
    relevantForExams: ['UPSC', 'PSC', 'UGC NET']
  },
  {
    id: '2',
    title: 'Banking Sector Updates: New Digital Payment Guidelines',
    description: 'RBI issues new guidelines for digital payments affecting banking operations.',
    url: '#',
    source: 'Financial Express',
    publishedAt: new Date().toISOString(),
    category: 'Banking',
    relevantForExams: ['Banking', 'SSC']
  },
  {
    id: '3',
    title: 'Science & Technology: Space Mission Launch Success',
    description: 'ISRO successfully launches new satellite mission with international collaboration.',
    url: '#',
    source: 'Science Daily',
    publishedAt: new Date().toISOString(),
    category: 'Science',
    relevantForExams: ['UPSC', 'PSC', 'UGC NET']
  }
];

export const getCachedNews = (): NewsItem[] => {
  try {
    const cached = localStorage.getItem(NEWS_CACHE_KEY);
    return cached ? JSON.parse(cached) : fallbackNews;
  } catch (error) {
    console.error('Error reading cached news:', error);
    return fallbackNews;
  }
};

export const cacheNews = (news: NewsItem[]): void => {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
    localStorage.setItem(NEWS_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching news:', error);
  }
};

export const shouldRefreshNews = (): boolean => {
  try {
    const lastFetch = localStorage.getItem(NEWS_CACHE_TIMESTAMP_KEY);
    if (!lastFetch) return true;
    
    const timeSinceLastFetch = Date.now() - parseInt(lastFetch);
    return timeSinceLastFetch > CACHE_DURATION;
  } catch (error) {
    return true;
  }
};

export const getTimeUntilNextRefresh = (): number => {
  try {
    const lastFetch = localStorage.getItem(NEWS_CACHE_TIMESTAMP_KEY);
    if (!lastFetch) return 0;
    
    const timeSinceLastFetch = Date.now() - parseInt(lastFetch);
    const timeUntilNext = CACHE_DURATION - timeSinceLastFetch;
    return Math.max(0, Math.ceil(timeUntilNext / 1000));
  } catch (error) {
    return 0;
  }
};

export const forceRefreshNews = (): void => {
  localStorage.removeItem(NEWS_CACHE_TIMESTAMP_KEY);
};

export const fetchNews = async (examTypes: ExamType[] = []): Promise<NewsItem[]> => {
  try {
    // For now, return cached/fallback news with exam filtering
    const allNews = getCachedNews();
    
    if (examTypes.length === 0) {
      return allNews;
    }
    
    return allNews.filter(item => 
      item.relevantForExams.some(exam => examTypes.includes(exam))
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return fallbackNews;
  }
};

// Auto-refresh functionality
let refreshInterval: NodeJS.Timeout | null = null;

export const startAutoRefresh = (callback: () => void): void => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  refreshInterval = setInterval(() => {
    if (shouldRefreshNews()) {
      callback();
    }
  }, 30000); // Check every 30 seconds
};

export const stopAutoRefresh = (): void => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
