import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let currentSyncId = localStorage.getItem('household_sync_id') || '';

export function setSyncId(id: string) {
  currentSyncId = id;
}

export function getSyncId() {
  return currentSyncId;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (currentSyncId) {
        headers.set('x-household-sync-id', currentSyncId);
      }
      return fetch(input, { ...init, headers });
    },
  },
});
