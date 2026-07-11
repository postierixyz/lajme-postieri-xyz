/**
 * Supabase client — server-side for SSR data fetching
 * Uses @supabase/supabase-js directly (not @supabase/ssr) for server components
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server components (SSR) — anon key, respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// For server-side with service role (bypasses RLS — used in API routes/cron)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

// Types
export interface Source {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  rss_url: string;
  region: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  last_fetched_at: string | null;
  fetch_error: string | null;
}

export interface Article {
  id: string;
  source_id: string;
  title: string;
  url: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  author: string | null;
  published_at: string | null;
  created_at: string;
  source_name?: string;
  source_slug?: string;
  source_region?: string;
  source_logo?: string | null;
}

export const CATEGORIES = [
  "të gjitha",
  "politikë",
  "ekonomi",
  "sport",
  "kulturë",
  "teknologji",
  "bota",
  "të tjera",
] as const;

export const REGIONS = ["Kosovë", "Shqipëri", "Maqedoni"] as const;