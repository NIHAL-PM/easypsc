
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
    const requestBody = await req.json();
    const { action = 'get-all-stats' } = requestBody;

    if (action === 'get-all-stats') {
      // Get count of total users
      const { count: totalUsers, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) {
        console.error('Error fetching user count:', userError);
      }

      // Get count of active users in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (activeError && activeError.code !== 'PGRST116') {
        console.error('Error fetching active users:', activeError);
      }

      // Get count of questions
      const { count: questionsGenerated, error: questionsError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      if (questionsError && questionsError.code !== 'PGRST116') {
        console.error('Error fetching question count:', questionsError);
      }

      // Get count of questions answered from user_activities
      const { count: questionsAnswered, error: answeredError } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'answer_question');

      if (answeredError && answeredError.code !== 'PGRST116') {
        console.error('Error fetching answered questions:', answeredError);
      }

      const stats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        questionsGenerated: questionsGenerated || 0,
        questionsAnswered: questionsAnswered || 0
      };

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in system-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
