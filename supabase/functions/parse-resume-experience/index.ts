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

    // Use Lovable AI to parse the resume
    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/lovable-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract work experience entries from the resume text and return them as a JSON array. 
Each entry should have:
- title: job title/position
- company: company name
- period: time period (e.g., "Jan 2020 - Dec 2022" or "2020-2022")
- description: job responsibilities and achievements

Return ONLY valid JSON array, no markdown, no explanations. If no experience is found, return an empty array.

Example output:
[
  {
    "title": "Software Engineer",
    "company": "Tech Corp",
    "period": "Jan 2020 - Present",
    "description": "Developed web applications using React and Node.js. Led a team of 3 developers."
  }
]`
          },
          {
            role: 'user',
            content: `Parse this resume text and extract work experience:\n\n${resumeText}`
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.json();
      console.error('AI parsing error:', error);
      throw new Error(error.message || 'AI parsing failed');
    }

    const aiData = await aiResponse.json();

    console.log('AI response received:', aiData);

    // Extract the response text
    const aiContent = aiData?.choices?.[0]?.message?.content || '[]';
    console.log('AI response content:', aiContent);

    // Parse the JSON response
    let experiences: ExperienceEntry[];
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      experiences = JSON.parse(cleanedResponse);
      console.log('Parsed experiences:', experiences);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response was:', aiContent);
      experiences = [];
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
