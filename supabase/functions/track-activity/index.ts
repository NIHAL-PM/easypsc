
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
    console.log("Activity tracking request received:", JSON.stringify(requestBody));
    
    const { userId, action, details = {} } = requestBody;

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and action are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create helper function to ensure user_activities table exists
    async function ensureUserActivitiesTable() {
      try {
        // Check if the user_activities table exists
        const { error: checkError } = await supabase.from('user_activities').select('count(*)').limit(1);
        
        // Create the table if it doesn't exist
        if (checkError && checkError.code === 'PGRST116') {
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.user_activities (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              action TEXT NOT NULL,
              details JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `;
          
          // Execute raw SQL to create the table
          const { error: createError } = await supabase.rpc('execute_sql', { query: createTableQuery });
          if (createError) {
            console.error('Error creating user_activities table:', createError);
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error ensuring user_activities table exists:', error);
        return false;
      }
    }

    // Ensure user_activities table exists
    await ensureUserActivitiesTable();

    // Insert the activity into the user_activities table
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        action,
        details
      });

    if (error) {
      console.error('Error saving user activity:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track activity' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-activity function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
