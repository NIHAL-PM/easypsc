
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
    const { action, prompt, count, examType, difficulty, askedQuestionIds, language = 'english' } = await req.json();

    // Get the stored API key from our settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'GEMINI_API_KEY')
      .single();

    if (settingsError || !settingsData) {
      console.error('Error fetching API key:', settingsError);
      return new Response(
        JSON.stringify({ error: 'API key not configured on the server' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const GEMINI_API_KEY = settingsData.value;

    // Handle different actions
    if (action === 'generate-questions') {
      if (!prompt) {
        // Create a prompt for question generation with the specified language
        const generationPrompt = `Generate ${count} multiple-choice questions for ${examType} exam preparation. 
        Difficulty level: ${difficulty}.
        Generate questions in ${language}.
        
        Critical requirements:
        1. Generate completely new and unique questions that have not been used before.
        2. Each question must have a different topic/concept to ensure variety.
        3. Ensure the questions are factually accurate and relevant to the ${examType} exam.
        4. The language of the questions must be ${language}.
        
        Format each question with:
        1. Question text
        2. Four options (A, B, C, D)
        3. The correct option (0-indexed, 0 for A, 1 for B, etc.)
        4. A brief explanation of the correct answer
        5. Category/subject of the question
        
        Return as a JSON array of question objects with the following structure:
        {
          "id": "unique-id",
          "text": "question text",
          "options": ["option A", "option B", "option C", "option D"],
          "correctOption": 0,
          "explanation": "explanation of the correct answer",
          "category": "subject/category",
          "difficulty": "${difficulty}",
          "language": "${language}"
        }`;

        console.log('Calling Gemini API with generated prompt for language:', language);
        
        // Call the Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: generationPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 8192,
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Gemini API error:', errorData);
          return new Response(
            JSON.stringify({ error: `API error: ${response.status}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
          );
        }

        const data = await response.json();
        console.log('Gemini API response received');

        // Extract the content from the response
        const jsonContent = data.candidates[0].content.parts[0].text;

        // Extract the JSON array from the response (handling markdown code blocks if present)
        const jsonRegex = /```(?:json)?([\s\S]*?)```|(\[[\s\S]*\])/;
        const match = jsonRegex.exec(jsonContent);

        if (!match) {
          return new Response(
            JSON.stringify({ error: 'Failed to parse JSON response from API' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        const questionsJson = match[1]?.trim() || match[2]?.trim() || match[0]?.trim();
        let questions = JSON.parse(questionsJson);

        // Filter out questions that have already been asked
        if (askedQuestionIds && askedQuestionIds.length > 0) {
          questions = questions.filter(q => !askedQuestionIds.includes(q.id));
        }

        // Store the generated questions in Supabase for future reference
        const { error: insertError } = await supabase
          .from('questions')
          .insert(questions.map(q => ({
            question: q.text,
            options: q.options,
            correct_answer: q.options[q.correctOption],
            explanation: q.explanation,
            difficulty_level: q.difficulty,
            tags: [q.category],
            exam_category_id: null, // We'll need to create a mapping for this
            is_current_affairs: false,
            language: language
          })));

        if (insertError) {
          console.error('Error storing questions in database:', insertError);
          // Continue anyway, we'll return the questions even if storage fails
        }

        return new Response(
          JSON.stringify({ questions: questions.slice(0, count) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Use the provided prompt directly
        console.log('Calling Gemini API with provided prompt');
        
        // Call the Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 8192,
              }
            })
          }
        );

        const data = await response.json();
        return new Response(
          JSON.stringify({ response: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (action === 'generate-chat') {
      // Handle chat generation
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Prompt is required for chat generation' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log('Generating chat response with prompt:', prompt);
      
      // Call the Gemini API for chat
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert exam preparation assistant for competitive exams like UPSC, PSC, SSC, and Banking exams. 
                    Provide helpful, accurate, and concise answers to the user's questions. Focus on being educational and helpful.
                    
                    User message: ${prompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 4096,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error in chat:', errorData);
        return new Response(
          JSON.stringify({ error: `API error: ${response.status}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }

      const data = await response.json();
      
      // Extract the content from the response
      const chatResponse = data.candidates[0].content.parts[0].text;
      return new Response(
        JSON.stringify({ response: chatResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action specified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in gemini-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
