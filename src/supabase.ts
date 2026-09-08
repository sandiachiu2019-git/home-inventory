import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createSyncClient(syncId: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { 'x-household-sync-id': syncId } },
  });
}
