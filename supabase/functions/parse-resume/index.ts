import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName, linkedinUrl, githubUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing resume parse request:', { fileName, linkedinUrl, githubUrl });

    const systemPrompt = `You are a career data extraction expert. Extract and structure career information from resumes and professional profiles.

Return ONLY valid JSON in this exact structure (no markdown, no explanations):
{
  "profile": {
    "name": "Full Name",
    "title": "Professional Title",
    "location": "City, Country"
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "period": "Start Date - End Date",
      "description": "Brief description of responsibilities"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date Obtained",
      "url": "Credential URL (if available)"
    }
  ]
}

IMPORTANT: For certifications, always try to include the URL/link to the credential if it's available in the source data.`;

    // Build the user message content
    const userContent: any[] = [];
    
    let textPrompt = "Parse the following career information and extract structured data:\n\n";
    
    if (linkedinUrl) {
      textPrompt += `LinkedIn URL: ${linkedinUrl}\n`;
    }
    
    if (githubUrl) {
      textPrompt += `GitHub URL: ${githubUrl}\n`;
    }
    
    userContent.push({ type: 'text', text: textPrompt });
    
    // Add file data if present - properly formatted for multimodal input
    if (fileData) {
      console.log('Adding file data to request');
      userContent.push({
        type: 'image_url',
        image_url: {
          url: fileData
        }
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response:', content);

    // Parse the JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(jsonContent);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('Failed to parse AI response');
    }

    // Add unique IDs to arrays
    if (parsedData.experience) {
      parsedData.experience = parsedData.experience.map((exp: any) => ({
        ...exp,
        id: crypto.randomUUID(),
      }));
    }

    if (parsedData.certifications) {
      parsedData.certifications = parsedData.certifications.map((cert: any) => ({
        ...cert,
        id: crypto.randomUUID(),
      }));
    }

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-resume function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});