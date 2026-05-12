import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.\n' +
    'Get them from https://supabase.com/dashboard/project/_/settings/api'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
