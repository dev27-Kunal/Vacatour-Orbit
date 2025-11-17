import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Legacy Supabase client - only used for file storage and email confirmation
// NOT required for authentication (we use session-based auth instead)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase client not configured - some legacy features may not work');
  console.warn('Missing:', !supabaseUrl ? 'VITE_SUPABASE_URL' : 'VITE_SUPABASE_ANON_KEY');
}

// Determine the app URL based on environment
const getAppUrl = () => {
  // Check for Vite environment variable first
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  // In production, use the production URL
  if (import.meta.env.MODE === 'production') {
    return 'https://vacature-orbit.vercel.app';
  }
  // In development, use localhost
  return 'http://localhost:5174';
};

// Create Supabase client with fallback for missing config
// Uses placeholder values if env vars are missing to prevent runtime errors
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key-not-configured',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

// Database types (for TypeScript)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          company_name?: string;
          user_type: 'BEDRIJF' | 'ZZP' | 'BUREAU' | 'SOLLICITANT';
          is_admin: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          language: string;
          timezone: string;
          date_format: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

export default supabase;