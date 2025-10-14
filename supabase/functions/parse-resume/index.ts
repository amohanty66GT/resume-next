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

    const { resumeText, linkedinUrl, githubUrl } = await req.json();

    // Validate input
    validateTextLength(resumeText, 50000, 'Resume text'); // 50KB limit

    console.log('Processing resume parse request with text length:', resumeText?.length);

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

    const parsedData = {
      profile: {
        name: "",
        title: "",
        location: ""
      },
      experience: resumeText ? parseExperience(resumeText) : [],
      certifications: []
    };

    console.log('Parsed experience entries:', parsedData.experience.length);

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
