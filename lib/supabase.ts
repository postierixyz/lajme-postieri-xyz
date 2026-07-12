/**
 * Supabase client — server-side for SSR data fetching
 * Uses process.env directly (NOT NEXT_PUBLIC_) to read at runtime,
 * because NEXT_PUBLIC_ vars are inlined at build time.
 * The Dockerfile builds with placeholder values, but the runtime
 * container has the correct ones via Coolify env vars.
 */
import { createClient } from "@supabase/supabase-js";

function getEnv(key: string, fallback = ""): string {
  // process.env is evaluated at runtime, not build time
  return process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || fallback;
}

const supabaseUrl = getEnv("SUPABASE_URL", getEnv("NEXT_PUBLIC_SUPABASE_URL"));
const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY", getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));

// For server components (SSR) — anon key, respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// For server-side with service role (bypasses RLS — used in API routes/cron)
export const supabaseAdmin = createClient(
  supabaseUrl,
  getEnv("SUPABASE_SERVICE_ROLE_KEY"),
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
  year: number;
  full_content: string | null;
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