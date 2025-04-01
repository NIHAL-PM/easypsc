
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

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get premium users
    const { count: premiumUsers, error: premiumError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);

    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: activeToday, error: activeError } = await supabase
      .from('user_activities')
      .select('user_id')
      .gte('created_at', today.toISOString())
      .order('user_id');

    // Get unique active user count
    const uniqueActiveUserIds = activeToday 
      ? [...new Set(activeToday.map(a => a.user_id))]
      : [];

    // Get question statistics
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('questions_attempted, questions_correct');

    let totalQuestionsAnswered = 0;
    let totalQuestionsCorrect = 0;

    if (progressData) {
      totalQuestionsAnswered = progressData.reduce((sum, record) => sum + (record.questions_attempted || 0), 0);
      totalQuestionsCorrect = progressData.reduce((sum, record) => sum + (record.questions_correct || 0), 0);
    }

    // Compile exam type distribution
    const { data: examData, error: examError } = await supabase
      .from('profiles')
      .select('preferred_exams');

    const examTypeDistribution: Record<string, number> = {};
    
    if (examData) {
      examData.forEach(profile => {
        if (profile.preferred_exams && Array.isArray(profile.preferred_exams)) {
          profile.preferred_exams.forEach((examId: string) => {
            examTypeDistribution[examId] = (examTypeDistribution[examId] || 0) + 1;
          });
        }
      });
    }

    if (usersError || premiumError || activeError || progressError || examError) {
      console.error('Error fetching stats:', { usersError, premiumError, activeError, progressError, examError });
      return new Response(
        JSON.stringify({ error: 'Failed to fetch system statistics' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        activeToday: uniqueActiveUserIds.length,
        totalQuestionsAnswered,
        totalQuestionsCorrect,
        examTypeDistribution
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in system-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
