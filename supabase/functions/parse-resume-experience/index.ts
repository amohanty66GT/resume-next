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

interface ProjectEntry {
  name: string;
  description: string;
  technologies: string;
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
            content: `Extract work experience entries AND project entries from this resume text. Look for both professional work experience and projects/side projects:\n\n${resumeText}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_data',
              description: 'Extract structured work experience and project entries from resume text',
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
                  },
                  projects: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          description: 'Project name'
                        },
                        description: {
                          type: 'string',
                          description: 'Project description and what was built'
                        },
                        technologies: {
                          type: 'string',
                          description: 'Technologies used, comma-separated (e.g., "React, Node.js, MongoDB")'
                        }
                      },
                      required: ['name', 'description', 'technologies'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['experiences', 'projects'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_data' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', JSON.stringify(aiData, null, 2));

    // Extract experiences and projects from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let experiences: ExperienceEntry[] = [];
    let projects: ProjectEntry[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        experiences = parsed.experiences || [];
        projects = parsed.projects || [];
        console.log('Parsed experiences:', experiences);
        console.log('Parsed projects:', projects);
      } catch (parseError) {
        console.error('Failed to parse tool call arguments:', parseError);
        console.error('Arguments were:', toolCall.function.arguments);
      }
    }

    if (experiences.length === 0 && projects.length === 0) {
      console.log('No experiences or projects extracted, returning empty arrays');
    }

    return new Response(
      JSON.stringify({ experiences, projects }),
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
