
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

    // Create helper function to ensure chat_messages table exists
    async function ensureChatMessagesTable() {
      try {
        // Check if the chat_messages table exists
        const { error: checkError } = await supabase.from('chat_messages').select('count(*)').limit(1);
        
        // Create the table if it doesn't exist
        if (checkError && checkError.code === 'PGRST116') {
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.chat_messages (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              user_name TEXT NOT NULL,
              exam_category TEXT NOT NULL,
              message TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            ALTER TABLE public.chat_messages ENABLE REPLICA IDENTITY FULL;
          `;
          
          // Execute raw SQL to create the table
          const { error: createError } = await supabase.rpc('execute_sql', { query: createTableQuery });
          if (createError) {
            console.error('Error creating chat_messages table:', createError);
            return false;
          }
          
          // Add the table to the realtime publication
          const addToRealtimeQuery = `
            BEGIN;
            DROP PUBLICATION IF EXISTS supabase_realtime;
            CREATE PUBLICATION supabase_realtime FOR TABLE chat_messages;
            COMMIT;
          `;
          
          const { error: realtimeError } = await supabase.rpc('execute_sql', { query: addToRealtimeQuery });
          if (realtimeError) {
            console.error('Error adding chat_messages to realtime:', realtimeError);
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error ensuring chat_messages table exists:', error);
        return false;
      }
    }

    // Ensure chat_messages table exists
    await ensureChatMessagesTable();

    // Handle different actions
    if (action === 'send-message') {
      if (!message || !userId || !examType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: message, userId, and examType are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
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
