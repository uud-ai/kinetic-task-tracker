import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message = 'Не заданы переменные окружения VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.';
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `<div style="font-family:sans-serif;padding:2rem;color:#fff;background:#111">${message}</div>`;
  }
  throw new Error(message);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
