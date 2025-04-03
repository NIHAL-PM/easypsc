
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.1';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

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
    await ensureSettingsTable(supabaseAdmin);
    
    // First try to get API key from environment variable
    let GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    // If not in environment, try to get from settings table
    if (!GEMINI_API_KEY) {
      const { data: keyData, error: keyError } = await supabaseAdmin
        .from('settings')
        .select('value')
        .eq('key', 'GEMINI_API_KEY')
        .single();
      
      if (keyError && keyError.code !== 'PGRST116') {
        console.error('Error getting GEMINI_API_KEY:', keyError);
        return new Response(
          JSON.stringify({
            error: 'Unable to retrieve API key'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      GEMINI_API_KEY = keyData?.value || 'AIzaSyC_OCnmU3eQUn0IhDUyY6nyMdcI0hM8Vik'; // Use default if not found
    }
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'Gemini API key not configured'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Initialize the Google Generative AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Parse the request body
    const { action, ...requestParams } = await req.json();
    
    if (action === 'generate-questions') {
      const { examType, difficulty, count = 5, askedQuestionIds = [], language = 'english' } = requestParams;
      
      // Create a system prompt for generating questions based on exam type and difficulty
      let systemPrompt = `Generate ${count} multiple choice questions for ${examType} exam preparation at ${difficulty} difficulty level. `;
      
      // Add language instruction
      systemPrompt += `Please provide the questions and all content in ${language} language. `;
      
      // Add more specific instructions based on exam type
      if (examType === 'UPSC') {
        systemPrompt += "Focus on Indian history, polity, geography, and current affairs. ";
      } else if (examType === 'SSC') {
        systemPrompt += "Include questions on general knowledge, quantitative aptitude, and reasoning. ";
      } else if (examType === 'Banking') {
        systemPrompt += "Include questions on banking awareness, quantitative aptitude, and reasoning. ";
      } else if (examType === 'PSC') {
        systemPrompt += "Focus on state-specific current affairs, history, geography and administration. ";
      }
      
      // Add formatting instructions
      systemPrompt += `
      Format each question as a JSON object with the following structure:
      {
        "id": "unique-id",
        "text": "question text",
        "options": ["option1", "option2", "option3", "option4"],
        "correctOption": 0-3 (index of correct option),
        "explanation": "explanation of the correct answer",
        "category": "subject category",
        "difficulty": "${difficulty}"
      }
      
      Return a JSON array of these question objects. Make sure each question has a unique ID and is not in the list of already asked questions: ${JSON.stringify(askedQuestionIds)}.
      `;
      
      try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const responseText = response.text();
        
        // Try to parse the response as JSON
        let questionsArray;
        try {
          // Try to parse the response as JSON directly
          questionsArray = JSON.parse(responseText);
          
          // Check if the response is wrapped in a code block (```json ... ```)
          if (!Array.isArray(questionsArray)) {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              questionsArray = JSON.parse(jsonMatch[1]);
            } else {
              // If we can't extract a JSON array, throw an error
              throw new Error('Could not parse response as JSON array');
            }
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          console.log('Raw response:', responseText);
          
          return new Response(
            JSON.stringify({
              error: 'Failed to parse generated questions',
              questions: []
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        // Ensure each question has a valid id
        questionsArray = questionsArray.map(q => ({
          ...q,
          id: q.id || uuidv4()
        }));
        
        // Save questions to database for re-use
        if (questionsArray.length > 0) {
          for (const question of questionsArray) {
            // Check if the question already exists by doing an upsert operation
            const { error: upsertError } = await supabaseAdmin
              .from('questions')
              .upsert({
                id: question.id,
                question: question.text,
                options: question.options,
                correct_answer: question.options[question.correctOption],
                explanation: question.explanation,
                tags: [question.category],
                difficulty_level: question.difficulty,
                exam_category_id: null // This would need to be mapped to an actual category ID
              });
              
            if (upsertError) {
              console.error('Error saving question:', upsertError);
            }
          }
        }
        
        return new Response(
          JSON.stringify({
            questions: questionsArray
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        console.error('Error generating questions:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate questions',
            questions: []
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else if (action === 'generate-chat') {
      const { prompt } = requestParams;
      
      try {
        // Simple chat generation
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const chatResponse = response.text();
        
        return new Response(
          JSON.stringify({
            response: chatResponse
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        console.error('Error generating chat:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate chat response',
            response: null
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Gemini API function error:', error);
    
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
