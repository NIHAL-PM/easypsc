
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { action, category } = await req.json();

    // Get the NEWS API key from our settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'NEWS_API_KEY')
      .single();

    if (settingsError || !settingsData) {
      console.error('Error fetching NEWS API key:', settingsError);
      // If no API key, return some mock data for testing
      return new Response(
        JSON.stringify({ 
          articles: [
            {
              title: "Mock News Article 1",
              description: "This is a mock news article for testing purposes",
              url: "https://example.com",
              urlToImage: "https://via.placeholder.com/150",
              publishedAt: new Date().toISOString(),
              source: { name: "Mock News Source" }
            },
            {
              title: "Mock News Article 2",
              description: "This is another mock news article for testing purposes",
              url: "https://example.com",
              urlToImage: "https://via.placeholder.com/150",
              publishedAt: new Date(Date.now() - 86400000).toISOString(),
              source: { name: "Mock News Source" }
            }
          ] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const NEWS_API_KEY = settingsData.value;
    
    if (action === 'get-news') {
      // Fetch news from NEWS API
      const newsCategory = category || 'general';
      const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=in&category=${newsCategory}&apiKey=${NEWS_API_KEY}`;
      
      console.log(`Fetching news from category: ${newsCategory}`);
      const response = await fetch(newsApiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('News API error:', errorData);
        return new Response(
          JSON.stringify({ error: `News API error: ${response.status}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }
      
      const newsData = await response.json();
      
      // Cache news in Supabase for future reference and faster access
      const { error: insertError } = await supabase
        .from('news_articles')
        .insert(newsData.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source: article.source?.name,
          category: newsCategory
        })));
        
      if (insertError) {
        console.error('Error caching news articles:', insertError);
        // Continue anyway, we'll return the articles even if caching fails
      }
      
      return new Response(
        JSON.stringify(newsData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in news-feed function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
