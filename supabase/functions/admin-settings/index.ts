
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to ensure the settings table exists
async function ensureSettingsTable(supabaseAdmin: any) {
  try {
    // Check if the settings table exists
    const { error: checkError } = await supabaseAdmin.from('settings').select('count(*)').limit(1);
    
    // Create the table if it doesn't exist
    if (checkError && checkError.code === 'PGRST116') {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `;
      
      // Execute raw SQL to create the table
      const { error: createError } = await supabaseAdmin.rpc('execute_sql', { query: createTableQuery });
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Create a Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Ensure settings table exists
    const tableExists = await ensureSettingsTable(supabaseAdmin);
    if (!tableExists) {
      return new Response(
        JSON.stringify({
          error: 'Failed to ensure settings table exists'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Parse the request body
    const { action, key, value } = await req.json();
    
    if (action === 'set') {
      // Validate inputs
      if (!key) {
        return new Response(
          JSON.stringify({
            error: 'Key is required'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Upsert the key-value pair
      const { data, error } = await supabaseAdmin
        .from('settings')
        .upsert(
          { key, value },
          { onConflict: 'key' }
        );
      
      if (error) {
        return new Response(
          JSON.stringify({
            error: 'Failed to save setting',
            details: error.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Setting '${key}' saved successfully`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (action === 'get') {
      // Validate inputs
      if (!key) {
        return new Response(
          JSON.stringify({
            error: 'Key is required'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Get the value for the key
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return new Response(
          JSON.stringify({
            error: 'Failed to get setting',
            details: error.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          value: data?.value || null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (action === 'delete') {
      // Validate inputs
      if (!key) {
        return new Response(
          JSON.stringify({
            error: 'Key is required'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Delete the key
      const { error } = await supabaseAdmin
        .from('settings')
        .delete()
        .eq('key', key);
      
      if (error) {
        return new Response(
          JSON.stringify({
            error: 'Failed to delete setting',
            details: error.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Setting '${key}' deleted successfully`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: 'Invalid action. Valid actions are: set, get, delete'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Admin settings function error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
