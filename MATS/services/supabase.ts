import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://btyerxwzgnuxyjxcvtjx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWVyeHd6Z251eHlqeGN2dGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDg5MDEsImV4cCI6MjA4NzAyNDkwMX0.fvDX1xJKKTzdK_pk7NquZHXs5m5ejCqPzWJofeInP4g';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Ho0C1ryAz51sZNIRKPhc_A_azeqWTIU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  publishableKey: SUPABASE_PUBLISHABLE_KEY
};
