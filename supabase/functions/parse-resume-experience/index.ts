/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      console.error('No resume text provided');
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Parsing resume text with AI...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    // Use Lovable AI Gateway with tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: `Extract work experience entries from this resume text:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_experience',
              description: 'Extract structured work experience entries from resume text',
              parameters: {
                type: 'object',
                properties: {
                  experiences: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string',
                          description: 'Job title or position'
                        },
                        company: {
                          type: 'string',
                          description: 'Company name'
                        },
                        period: {
                          type: 'string',
                          description: 'Time period (e.g., "Jan 2020 - Dec 2022")'
                        },
                        description: {
                          type: 'string',
                          description: 'Job responsibilities and achievements'
                        }
                      },
                      required: ['title', 'company', 'period', 'description'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['experiences'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_experience' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', JSON.stringify(aiData, null, 2));

    // Extract experiences from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let experiences: ExperienceEntry[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        experiences = parsed.experiences || [];
        console.log('Parsed experiences:', experiences);
      } catch (parseError) {
        console.error('Failed to parse tool call arguments:', parseError);
        console.error('Arguments were:', toolCall.function.arguments);
      }
    }

    if (experiences.length === 0) {
      console.log('No experiences extracted, returning empty array');
    }

    return new Response(
      JSON.stringify({ experiences }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error in parse-resume-experience:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
