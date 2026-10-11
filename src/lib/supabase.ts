import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqbbvbvxlegqtguoyhfu.supabase.co';
// Priority: SUPABASE_SERVICE_ROLE_KEY > NEXT_PUBLIC_SUPABASE_SECRET_KEY > NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!supabaseServiceKey) {
  console.warn('Warning: Supabase service role key is not configured.');
}

/**
 * Server-side Supabase Admin Client.
 * Bypasses RLS to allow full administrative access to products, orders, inventory, and users.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
