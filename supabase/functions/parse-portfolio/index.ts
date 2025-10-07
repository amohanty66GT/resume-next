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
    const { portfolioUrl } = await req.json();
    console.log('Fetching portfolio URL:', portfolioUrl);

    if (!portfolioUrl) {
      return new Response(
        JSON.stringify({ error: 'Portfolio URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the portfolio website
    const websiteResponse = await fetch(portfolioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioParser/1.0)',
      },
    });

    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch portfolio: ${websiteResponse.status}`);
    }

    const htmlContent = await websiteResponse.text();
    console.log('Fetched HTML content, length:', htmlContent.length);

    // Extract text content from HTML (basic parsing)
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limit to 15k chars for AI processing

    console.log('Extracted text content, length:', textContent.length);

    // Use AI to parse and extract structured data
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
            content: `Analyze this portfolio website content and extract structured information about projects, skills, and experience. Return the data in a structured format.\n\nWebsite URL: ${portfolioUrl}\n\nContent:\n${textContent}`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_portfolio_data',
              description: 'Extract structured portfolio data including projects and profile information',
              parameters: {
                type: 'object',
                properties: {
                  profile: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Person\'s name if found' },
                      title: { type: 'string', description: 'Professional title if found' },
                      bio: { type: 'string', description: 'Short bio or description' },
                    },
                  },
                  projects: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Project name' },
                        description: { type: 'string', description: 'Project description' },
                        technologies: { type: 'string', description: 'Technologies used (comma-separated)' },
                      },
                      required: ['name', 'description'],
                    },
                  },
                  frameworks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Framework or technology name' },
                        proficiency: { type: 'string', description: 'Proficiency level (Beginner/Intermediate/Advanced/Expert)' },
                      },
                      required: ['name'],
                    },
                  },
                },
                required: ['projects'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_portfolio_data' } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call found in AI response');
    }

    const parsedData = JSON.parse(toolCall.function.arguments);
    console.log('Parsed portfolio data:', parsedData);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
        sourceUrl: portfolioUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error parsing portfolio:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse portfolio',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
