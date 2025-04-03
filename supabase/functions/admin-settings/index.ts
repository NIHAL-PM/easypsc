
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

    // Create helper function to ensure settings table exists
    async function ensureSettingsTable() {
      try {
        // Check if the settings table exists
        const { error: checkError } = await supabase.from('settings').select('count(*)').limit(1);
        
        // Create the table if it doesn't exist
        if (checkError && checkError.code === 'PGRST116') {
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.settings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              key TEXT UNIQUE NOT NULL,
              value TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
          `;
          
          // Execute raw SQL to create the table
          const { error: createError } = await supabase.rpc('execute_sql', { query: createTableQuery });
          if (createError) {
            console.error('Error creating settings table:', createError);
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error ensuring settings table exists:', error);
        return false;
      }
    }

    // Parse the request body
    const requestBody = await req.json();
    console.log("Admin settings request received:", JSON.stringify(requestBody));
    
    const { action, key, value } = requestBody;

    // Ensure settings table exists
    await ensureSettingsTable();

    // Handle different actions
    if (action === 'set') {
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: key' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          key: key,
          value: value,
          updated_at: new Date()
        })
        .select();

      if (error) {
        console.error('Error saving setting:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save setting' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get') {
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: key' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Get setting by key
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching setting:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch setting' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ value: data?.value || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'delete') {
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: key' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Delete setting by key
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', key);

      if (error) {
        console.error('Error deleting setting:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete setting' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'clear-database') {
      // This is a dangerous operation, so we should implement additional checks
      // Clear various tables while preserving admin settings
      const tables = ['chat_messages', 'questions', 'user_progress'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 'any-unique-id-that-doesnt-exist');  // Delete all rows
          
        if (error && error.code !== 'PGRST116') {
          console.error(`Error clearing table ${table}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Database cleared successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in admin-settings function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
