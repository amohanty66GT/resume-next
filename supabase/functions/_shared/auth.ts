import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export { corsHeaders };

/**
 * Authenticates the request and returns the user ID
 * @param req The incoming request
 * @returns The authenticated user ID or throws an error
 */
export async function authenticateRequest(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new AuthError('Missing authorization header', 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration');
    throw new AuthError('Server configuration error', 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Authentication failed:', error?.message);
    throw new AuthError('Invalid or expired token', 401);
  }

  console.log('Authenticated user:', user.id);
  return user.id;
}

/**
 * Custom error class for authentication failures
 */
export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Validates text input length
 */
export function validateTextLength(text: string, maxLength: number, fieldName: string): void {
  if (!text || text.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (text.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
}

/**
 * Validates URL format and domain restrictions
 */
export function validateUrl(url: string, allowedDomains?: string[]): void {
  try {
    const parsedUrl = new URL(url);
    
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        throw new ValidationError(`URL domain must be one of: ${allowedDomains.join(', ')}`);
      }
    }
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid URL format');
  }
}

/**
 * Custom error class for validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
