
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminRequestParams {
  action: string;
  key?: string;
  value?: string;
  username?: string;
  password?: string;
}

const ADMIN_CREDENTIALS = {
  username: 'bluewaterbottle',
  password: 'waterbottle'
};

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
    
    // Parse request
    const params: AdminRequestParams = await req.json();
    const { action, key, value, username, password } = params;
    
    // Validate admin credentials for certain actions
    if (action === 'set' || action === 'delete') {
      // Check if the provided credentials match the admin credentials
      // Don't do this in production; use JWT or more secure auth
      if (!username || !password || username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: 'Unauthorized'
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    if (action === 'set' && key && value !== undefined) {
      // First check if the setting already exists
      const { data: existingData, error: existingError } = await supabaseAdmin
        .from('settings')
        .select('id')
        .eq('key', key)
        .single();
      
      if (existingError && existingError.code !== 'PGRST116') {
        throw new Error(`Error checking setting: ${existingError.message}`);
      }
      
      // If the setting exists, update it; otherwise, insert a new record
      const { error: upsertError } = await supabaseAdmin
        .from('settings')
        .upsert({
          id: existingData?.id,
          key,
          value,
          updated_at: new Date().toISOString()
        });
      
      if (upsertError) {
        throw new Error(`Error saving setting: ${upsertError.message}`);
      }
      
      return new Response(
        JSON.stringify({
          status: 'success',
          message: 'Setting saved successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (action === 'get' && key) {
      // Get a setting by key
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Error getting setting: ${error.message}`);
      }
      
      return new Response(
        JSON.stringify({
          status: 'success',
          value: data?.value || null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (action === 'delete' && key) {
      // Delete a setting by key
      const { error } = await supabaseAdmin
        .from('settings')
        .delete()
        .eq('key', key);
      
      if (error) {
        throw new Error(`Error deleting setting: ${error.message}`);
      }
      
      return new Response(
        JSON.stringify({
          status: 'success',
          message: 'Setting deleted successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (action === 'verify-admin') {
      // Verify admin credentials
      const isValidAdmin = username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
      
      return new Response(
        JSON.stringify({
          status: 'success',
          isValidAdmin
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      throw new Error('Invalid action or missing parameters');
    }
  } catch (error) {
    console.error('Admin-settings function error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'An unexpected error occurred',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
