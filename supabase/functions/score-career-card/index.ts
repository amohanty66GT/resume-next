import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { careerCardData, companyDescription, roleDescription } = await req.json();
    
    if (!careerCardData || !companyDescription || !roleDescription) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert career advisor and recruiter. Analyze how well a candidate's career card aligns with a specific company and role.

Your analysis should be thorough, fair, and constructive. Consider:
- Technical skills match
- Experience relevance
- Cultural fit based on work styles and values
- Project alignment with company needs
- Overall qualifications

Be specific and provide actionable feedback.`;

    const userPrompt = `Analyze this career card for alignment with the company and role:

COMPANY DESCRIPTION:
${companyDescription}

ROLE DESCRIPTION:
${roleDescription}

CAREER CARD:
${JSON.stringify(careerCardData, null, 2)}

Provide a comprehensive scoring and feedback.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_career_card",
              description: "Provide a detailed score and feedback for career card alignment",
              parameters: {
                type: "object",
                properties: {
                  overallScore: {
                    type: "number",
                    description: "Overall alignment score from 0-100"
                  },
                  categoryScores: {
                    type: "object",
                    properties: {
                      technicalSkills: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          feedback: { type: "string" }
                        },
                        required: ["score", "feedback"]
                      },
                      experience: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          feedback: { type: "string" }
                        },
                        required: ["score", "feedback"]
                      },
                      culturalFit: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          feedback: { type: "string" }
                        },
                        required: ["score", "feedback"]
                      },
                      projectAlignment: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          feedback: { type: "string" }
                        },
                        required: ["score", "feedback"]
                      }
                    },
                    required: ["technicalSkills", "experience", "culturalFit", "projectAlignment"]
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key strengths for this role"
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas for improvement or gaps"
                  },
                  overallFeedback: {
                    type: "string",
                    description: "Comprehensive summary feedback"
                  }
                },
                required: ["overallScore", "categoryScores", "strengths", "improvements", "overallFeedback"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "score_career_card" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const scoringResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(scoringResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in score-career-card function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
