import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqbbvbvxlegqtguoyhfu.supabase.co';
const rawKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawKey) {
  console.warn('Warning: Supabase service role key is not configured.');
}

// Fallback dummy key prevents createClient from crashing during build-time static evaluation
const supabaseServiceKey = rawKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_build_key';

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
