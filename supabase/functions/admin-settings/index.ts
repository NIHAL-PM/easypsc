
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
    const requestData = await req.json();
    const { action, key, value } = requestData;

    // Helper function to create settings table if it doesn't exist
    const ensureSettingsTableExists = async () => {
      try {
        // Try to create the table if it doesn't exist
        await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `);
        return true;
      } catch (error) {
        console.error('Error creating settings table:', error);
        return false;
      }
    };

    // Handle different actions
    if (action === 'ensure-table-exists') {
      const tableCreated = await ensureSettingsTableExists();
      
      return new Response(
        JSON.stringify({ success: tableCreated }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get') {
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: key' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Make sure the table exists
      await ensureSettingsTableExists();

      // Get the setting value
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
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
    } else if (action === 'set') {
      if (!key || value === undefined) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: key and value are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Make sure the table exists
      await ensureSettingsTableExists();

      // Check if the setting exists
      const { data: existingData, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .single();

      let result;
      if (!existingData) {
        // Insert new setting
        result = await supabase
          .from('settings')
          .insert({
            key,
            value: String(value),
          });
      } else {
        // Update existing setting
        result = await supabase
          .from('settings')
          .update({
            value: String(value),
            updated_at: new Date(),
          })
          .eq('key', key);
      }

      if (result.error) {
        console.error('Error saving setting:', result.error);
        return new Response(
          JSON.stringify({ error: 'Failed to save setting' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
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
