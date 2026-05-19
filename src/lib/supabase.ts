import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'Get them from https://supabase.com/dashboard/project/_/settings/api'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchSingleton(table: string): Promise<{ en: Record<string, any>; es: Record<string, any> }> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  const en = data?.find((r: any) => r.language === 'en') || {};
  const es = data?.find((r: any) => r.language === 'es') || {};
  const { language: _1, ...enClean } = en;
  const { language: _2, ...esClean } = es;
  return { en: enClean, es: esClean };
}

export async function fetchList(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data || [];
}

export async function fetchStatus() {
  const { data, error } = await supabase.from('status').select('*').single();
  if (error && error.code !== 'PGRST116') throw error;
  return { isAvailable: data?.is_available ?? true };
}
