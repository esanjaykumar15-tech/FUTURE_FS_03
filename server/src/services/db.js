import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Strip characters that have meaning inside PostgREST filter strings / LIKE patterns.
export const safeSearch = (q) => q.replace(/[,()%_*\\]/g, ' ').trim();
