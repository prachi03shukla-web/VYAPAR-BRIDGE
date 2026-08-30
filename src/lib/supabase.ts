import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ektxiuhwgutqtaejvjss.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sgIcVUnr9p8xdm49bEXlhg_0ANV0M8b';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
