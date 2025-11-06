import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Singleton Supabase client instance for frontend
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
  }
  return supabaseClient;
}

export const supabase = getSupabaseClient();

// Helper to get server URL
export function getServerUrl(route: string) {
  return `https://${projectId}.supabase.co/functions/v1/make-server-98e3e7a7${route}`;
}

// Helper to make authenticated requests
export async function makeAuthRequest(route: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || publicAnonKey;

  const response = await fetch(getServerUrl(route), {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}
