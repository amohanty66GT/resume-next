import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, corsHeaders, AuthError, validateTextLength, ValidationError } from "../_shared/auth.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    console.log('Processing resume parse for user:', userId);

    const { resumeText, imageData } = await req.json();

    if (!resumeText && !imageData) {
      throw new ValidationError('Either resume text or image data is required');
    }

    console.log('Processing parse request - has text:', !!resumeText, 'has image:', !!imageData);

    let parsedData;

    if (imageData) {
      // Use Lovable AI vision model to parse career card image
      console.log('Processing image with vision AI');
      
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
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
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Extract all information from this career card image. Return a JSON object with this structure:
{
  "profile": { "name": "", "title": "", "location": "" },
  "experience": [{ "id": "", "title": "", "company": "", "period": "", "description": "" }],
  "frameworks": [{ "id": "", "name": "", "proficiency": "beginner|intermediate|expert" }],
  "projects": [{ "id": "", "name": "", "description": "", "technologies": "" }],
  "codeShowcase": [{ "id": "", "title": "", "description": "", "language": "" }],
  "pastimes": [{ "id": "", "activity": "", "description": "" }],
  "stylesOfWork": [{ "id": "", "style": "", "description": "" }],
  "greatestImpacts": [{ "id": "", "title": "", "description": "", "impact": "" }]
}
Generate a unique UUID for each id field. Extract all visible information from the image.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', response.status, errorText);
        throw new Error(`AI processing failed: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content || '';
      
      console.log('AI response:', content);
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      
      parsedData = JSON.parse(jsonMatch[0]);
    } else {
      // Simple text-based parsing using regex patterns
      const parseExperience = (text: string) => {
        const experiences: any[] = [];
        
        // Common patterns for experience sections
        const experiencePatterns = [
          /(?:experience|employment|work history)/i,
          /(?:professional experience)/i,
        ];
        
        // Find where experience section starts
        let experienceText = text;
        for (const pattern of experiencePatterns) {
          const match = text.match(pattern);
          if (match && match.index) {
            experienceText = text.substring(match.index);
            break;
          }
        }
        
        // Split by common job entry patterns
        const jobEntries = experienceText.split(/\n(?=[A-Z][a-z]+\s+(?:\d{4}|present))/i);
        
        for (const entry of jobEntries.slice(0, 10)) { // Limit to 10 entries
          // Try to extract job title, company, dates, and description
          const lines = entry.split('\n').filter(line => line.trim());
          if (lines.length < 2) continue;
          
          let title = '';
          let company = '';
          let period = '';
          let description = '';
          
          // Look for dates pattern
          const datePattern = /(\d{4}|\w+\s+\d{4})\s*[-–—]\s*(\d{4}|\w+\s+\d{4}|present)/i;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (datePattern.test(line) && !period) {
              period = line.match(datePattern)?.[0] || '';
            } else if (!title && line.length > 0 && line.length < 100) {
              title = line;
            } else if (!company && line.length > 0 && line.length < 100 && line !== title) {
              company = line;
            } else if (line.length > 20) {
              description += (description ? ' ' : '') + line;
            }
          }
          
          if (title && (company || period)) {
            experiences.push({
              id: crypto.randomUUID(),
              title: title || 'Position',
              company: company || 'Company',
              period: period || 'Dates',
              description: description.substring(0, 500) || 'Description'
            });
          }
        }
        
        return experiences;
      };

      parsedData = {
        profile: {
          name: "",
          title: "",
          location: ""
        },
        experience: resumeText ? parseExperience(resumeText) : [],
        certifications: []
      };
    }

    console.log('Parsed data:', parsedData);

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-resume function:', error);

    // Handle different error types with appropriate status codes
    if (error instanceof AuthError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: error.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
