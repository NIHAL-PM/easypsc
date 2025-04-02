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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, key, value } = await req.json();

    if (action === 'ensure-table-exists') {
      // Check if settings table exists, if not, create it
      const { error: checkError } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'settings' }
      );
      
      if (checkError) {
        console.log('Settings table does not exist, creating it now...');
        
        const { error: createError } = await supabase.rpc(
          'create_settings_table'
        );
        
        if (createError) {
          console.error('Error creating settings table:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create settings table' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // Set default API keys
        await supabase
          .from('settings')
          .upsert(
            [
              { key: 'GEMINI_API_KEY', value: 'AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik' },
              { key: 'NEWS_API_KEY', value: '7c64a4f4675a425ebe9fc4895fc6e273' }
            ],
            { onConflict: 'key' }
          );
        
        console.log('Settings table created and default API keys set');
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get') {
      if (!key) {
        return new Response(
          JSON.stringify({ error: 'Key parameter is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

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
        JSON.stringify({ value: data.value }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'set') {
      if (!key || value === undefined) {
        return new Response(
          JSON.stringify({ error: 'Key and value parameters are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        console.error('Error saving setting:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save setting' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'clear-database') {
      // This is a dangerous operation, only admin should be able to do this
      console.log('Clearing database...');
      
      // Delete all user data except settings and admin accounts
      
      // Delete user progress data
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all
      
      if (progressError) {
        console.error('Error deleting user progress:', progressError);
      }
      
      // Delete questions data if needed (you may want to keep questions)
      /*
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (questionsError) {
        console.error('Error deleting questions:', questionsError);
      }
      */
      
      return new Response(
        JSON.stringify({ success: true, message: 'Database cleared' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in admin-settings function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
