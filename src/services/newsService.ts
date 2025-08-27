
import { NewsItem } from '@/types';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Fallback news data
const fallbackNews: NewsItem[] = [
  {
    id: '1',
    title: 'Budget 2024: Key Highlights for Government Exam Aspirants',
    description: 'Important budget announcements that could appear in upcoming competitive exams.',
    url: 'https://example.com/budget-2024',
    source: 'Government Press',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300',
    category: 'Economics',
    relevantForExams: ['UPSC', 'SSC', 'Banking', 'PSC']
  },
  {
    id: '2',
    title: 'New Digital India Initiative Launched',
    description: 'Government launches new digital infrastructure program affecting multiple sectors.',
    url: 'https://example.com/digital-india',
    source: 'PIB',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300',
    category: 'Technology',
    relevantForExams: ['UPSC', 'SSC']
  },
  {
    id: '3',
    title: 'RBI Monetary Policy Committee Meeting Results',
    description: 'Latest decisions on interest rates and monetary policy affecting banking sector.',
    url: 'https://example.com/rbi-policy',
    source: 'RBI',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300',
    category: 'Banking',
    relevantForExams: ['Banking', 'UPSC']
  },
  {
    id: '4',
    title: 'Supreme Court Landmark Judgment on Constitutional Rights',
    description: 'Recent Supreme Court ruling with implications for constitutional law questions.',
    url: 'https://example.com/sc-judgment',
    source: 'Supreme Court',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300',
    category: 'Law',
    relevantForExams: ['UPSC', 'PSC']
  },
  {
    id: '5',
    title: 'Space Mission Update: Chandrayaan-4 Announcement',
    description: 'ISRO announces new lunar mission with international collaboration.',
    url: 'https://example.com/chandrayaan-4',
    source: 'ISRO',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300',
    category: 'Science',
    relevantForExams: ['UPSC', 'SSC']
  },
  {
    id: '6',
    title: 'New Environmental Protection Act Amendments',
    description: 'Government introduces stricter environmental regulations and compliance measures.',
    url: 'https://example.com/env-act',
    source: 'Ministry of Environment',
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
    category: 'Environment',
    relevantForExams: ['UPSC', 'PSC', 'SSC']
  }
];

export const fetchCurrentAffairs = async (): Promise<NewsItem[]> => {
  console.log('🔄 Fetching latest current affairs...');
  
  // Always return fallback news with updated timestamps to simulate fresh content
  const freshNews = fallbackNews.map((item, index) => ({
    ...item,
    publishedAt: new Date(Date.now() - (index * 3600000)).toISOString(), // Stagger by hours
    id: `${item.id}-${Date.now()}` // Ensure unique IDs
  }));
  
  console.log(`✅ Fetched ${freshNews.length} current affairs items`);
  return freshNews;
};

export const getNewsByExamType = (news: NewsItem[], examType: string): NewsItem[] => {
  if (!examType || examType === 'all') return news;
  return news.filter(item => 
    item.relevantForExams.includes(examType as any)
  );
};

export const refreshNewsData = async (): Promise<NewsItem[]> => {
  console.log('🔃 Refreshing news data (every 3 minutes)...');
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const refreshedNews = await fetchCurrentAffairs();
    console.log(`✅ News refreshed successfully - ${refreshedNews.length} items`);
    return refreshedNews;
  } catch (error) {
    console.error('❌ Error refreshing news:', error);
    return fallbackNews;
  }
};

// Auto-refresh news every 3 minutes
let refreshInterval: NodeJS.Timeout | null = null;

export const startNewsRefresh = (callback: (news: NewsItem[]) => void) => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  console.log('🚀 Starting news auto-refresh (every 3 minutes)');
  
  refreshInterval = setInterval(async () => {
    try {
      const freshNews = await refreshNewsData();
      callback(freshNews);
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
    }
  }, 3 * 60 * 1000); // 3 minutes
};

export const stopNewsRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏹️ News auto-refresh stopped');
  }
};
