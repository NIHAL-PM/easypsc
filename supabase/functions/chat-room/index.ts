
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
    console.log("Request received:", JSON.stringify(requestBody));
    
    const { action, examType, message, userId, userName } = requestBody;

    // Handle different actions
    if (action === 'send-message') {
      if (!message || !userId || !examType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: message, userId, and examType are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Create chat_messages table if it doesn't exist
      const { error: tableError } = await supabase.rpc('create_chat_messages_if_not_exists');
      if (tableError) {
        console.log('Error checking/creating chat_messages table:', tableError);
        // Continue anyway, the table might already exist
      }

      // Insert the message into the chat_messages table
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          exam_category: examType,
          message: message,
          user_name: userName || 'Anonymous'
        })
        .select();

      if (error) {
        console.error('Error saving chat message:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save message' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get-messages') {
      if (!examType) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: examType' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Create chat_messages table if it doesn't exist
      const { error: tableError } = await supabase.rpc('create_chat_messages_if_not_exists');
      if (tableError) {
        console.log('Error checking/creating chat_messages table:', tableError);
        // Continue anyway, the table might already exist
      }

      // Get chat messages for the specified exam type, limited to the last 100 messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('exam_category', examType)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching chat messages:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch messages' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ messages: data.reverse() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in chat-room function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
