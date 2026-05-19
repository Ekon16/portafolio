import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yywvjadsyunyaomnwfce.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5d3ZqYWRzeXVueWFvbW53ZmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjAyMTYsImV4cCI6MjA5NDA5NjIxNn0.N9vnGgRV18YpigTLTDL9jfetX2wNBbfaYNvcVZCUUHI'
);

export async function fetchSingleton(table: string): Promise<{ en: Record<string, any>; es: Record<string, any> }> {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    const en = data?.find((r: any) => r.language === 'en') || {};
    const es = data?.find((r: any) => r.language === 'es') || {};
    const { language: _1, ...enClean } = en;
    const { language: _2, ...esClean } = es;
    return { en: enClean, es: esClean };
  } catch (err) {
    console.error(`Failed to fetch ${table}:`, err);
    return { en: {}, es: {} };
  }
}

export async function fetchList(table: string) {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Failed to fetch ${table}:`, err);
    return [];
  }
}

export async function fetchStatus() {
  try {
    const { data, error } = await supabase.from('status').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    return { isAvailable: data?.is_available ?? true };
  } catch (err) {
    console.error('Failed to fetch status:', err);
    return { isAvailable: true };
  }
}
