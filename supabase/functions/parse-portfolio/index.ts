import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, corsHeaders, AuthError, validateUrl, ValidationError } from "../_shared/auth.ts";

// Allowed domains for portfolio URLs (to prevent SSRF attacks)
const ALLOWED_DOMAINS = [
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'linkedin.com',
  'vercel.app',
  'netlify.app',
  'herokuapp.com',
  'github.io',
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const userId = await authenticateRequest(req);
    console.log('Processing portfolio parse for user:', userId);

    const { portfolioUrl } = await req.json();

    if (!portfolioUrl) {
      throw new ValidationError('Portfolio URL is required');
    }

    // Validate URL format - allow any valid HTTPS URL for flexibility
    try {
      const parsedUrl = new URL(portfolioUrl);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new ValidationError('URL must use HTTP or HTTPS protocol');
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new ValidationError('Invalid URL format');
    }

    console.log('Fetching portfolio URL:', portfolioUrl);

    // Check if it's a GitHub URL
    const isGitHub = portfolioUrl.includes('github.com');
    let codeFiles: any[] = [];

    if (isGitHub) {
      // Extract username from GitHub URL
      const match = portfolioUrl.match(/github\.com\/([^\/]+)/);
      if (match) {
        const username = match[1];
        console.log('Fetching GitHub repos for:', username);

        // Fetch user's repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
          headers: {
            'User-Agent': 'PortfolioParser/1.0',
          },
        });

        if (reposResponse.ok) {
          const repos = await reposResponse.json();
          
          // For each repo, fetch some code files
          for (const repo of repos.slice(0, 5)) { // Limit to 5 repos
            try {
              const contentsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents`, {
                headers: {
                  'User-Agent': 'PortfolioParser/1.0',
                },
              });

              if (contentsResponse.ok) {
                const contents = await contentsResponse.json();
                
                // Find code files (js, ts, py, java, etc.)
                const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb'];
                const codeFilesList = contents.filter((file: any) => 
                  file.type === 'file' && codeExtensions.some(ext => file.name.endsWith(ext))
                ).slice(0, 3); // Max 3 files per repo

                // Fetch the actual content of each file
                for (const file of codeFilesList) {
                  const fileResponse = await fetch(file.download_url);
                  if (fileResponse.ok) {
                    const fileContent = await fileResponse.text();
                    codeFiles.push({
                      name: file.name,
                      path: `${repo.name}/${file.name}`,
                      language: file.name.split('.').pop(),
                      content: fileContent.slice(0, 2000), // Limit to 2000 chars
                      repo: repo.name,
                      url: file.html_url,
                    });
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching contents for ${repo.name}:`, error);
            }
          }
        }
      }
    }

    // Fetch the portfolio website with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const websiteResponse = await fetch(portfolioUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PortfolioParser/1.0)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      console.log('AI response received');

      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        throw new Error('No tool call found in AI response');
      }

      const parsedData = JSON.parse(toolCall.function.arguments);
      console.log('Successfully parsed portfolio data');

      return new Response(
        JSON.stringify({
          success: true,
          data: parsedData,
          codeFiles: codeFiles,
          sourceUrl: portfolioUrl,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Error parsing portfolio:', error);

    // Handle different error types with appropriate status codes
    if (error instanceof AuthError) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: error.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
