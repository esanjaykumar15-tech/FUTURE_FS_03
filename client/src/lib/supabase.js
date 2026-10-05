import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY; // public anon key only; never the service-role key

export const supabaseConfigured = Boolean(url && key && !url.includes('YOUR-PROJECT'));
export const supabase = supabaseConfigured ? createClient(url, key) : null;
