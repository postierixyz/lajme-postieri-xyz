-- =====================================================================
-- lajme.postieri.xyz — Database Schema
-- Albanian News Aggregator
-- =====================================================================

-- Enable extensions
create extension if not exists "pg_trgm";

-- =====================================================================
-- Sources (news portals)
-- =====================================================================
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text not null,
  rss_url text not null,
  region text not null default 'Kosovë', -- Kosovë, Shqipëri, Maqedoni
  logo_url text,
  description text,
  is_active boolean not null default true,
  last_fetched_at timestamptz,
  fetch_error text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Articles
-- =====================================================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  title text not null,
  url text not null,
  excerpt text,
  image_url text,
  category text not null default 'të tjera', -- politikë, ekonomi, sport, kulturë, teknologji, bota, të tjera
  author text,
  published_at timestamptz,
  guid text not null,
  created_at timestamptz not null default now(),
  unique(source_id, guid)
);

-- Indexes for performance
create index if not exists idx_articles_published_at on public.articles (published_at desc);
create index if not exists idx_articles_source_id on public.articles (source_id);
create index if not exists idx_articles_category on public.articles (category);
create index if not exists idx_articles_created_at on public.articles (created_at desc);
create index if not exists idx_articles_title_trgm on public.articles using gin (title gin_trgm_ops);

-- =====================================================================
-- Views for convenience
-- =====================================================================

-- Latest articles with source info
create or replace view public.v_latest_articles as
select
  a.id, a.title, a.url, a.excerpt, a.image_url, a.category,
  a.published_at, a.created_at,
  s.name as source_name, s.slug as source_slug, s.region as source_region,
  s.logo_url as source_logo
from public.articles a
join public.sources s on s.id = a.source_id
where s.is_active = true
order by coalesce(a.published_at, a.created_at) desc;

-- Article counts by source
create or replace view public.v_source_stats as
select
  s.id, s.name, s.slug, s.region, s.logo_url, s.is_active,
  count(a.id) as article_count,
  max(coalesce(a.published_at, a.created_at)) as latest_article_at
from public.sources s
left join public.articles a on a.source_id = s.id
group by s.id, s.name, s.slug, s.region, s.logo_url, s.is_active
order by article_count desc;

-- =====================================================================
-- Row Level Security (public read, no write from client)
-- =====================================================================
alter table public.sources enable row level security;
alter table public.articles enable row level security;

-- Public can read active sources
create policy "public_read_sources" on public.sources
  for select using (is_active = true);

-- Public can read all articles
create policy "public_read_articles" on public.articles
  for select using (true);

-- =====================================================================
-- Insert initial source data
-- =====================================================================
insert into public.sources (name, slug, website_url, rss_url, region, description) values
  -- KOSOVA
  ('Telegrafi', 'telegrafi', 'https://telegrafi.com', 'https://telegrafi.com/feed/', 'Kosovë', 'Portali më i vizituar i lajmeve në Kosovë'),
  ('Koha Ditore', 'koha-ditore', 'https://www.koha.net', 'https://www.koha.net/rss/', 'Kosovë', 'Gazeta ditore më e madhe në Kosovë'),
  ('Indeksonline', 'indeksonline', 'https://indeksonline.net', 'https://indeksonline.net/feed/', 'Kosovë', 'Portal i lajmeve me prioritet në Kosovë'),
  ('Kallxo', 'kallxo', 'https://kallxo.com', 'https://kallxo.com/feed/', 'Kosovë', 'Portal investigativ i lajmeve'),
  ('Gazeta Express', 'gazeta-express', 'https://www.gazetaexpress.com', 'https://www.gazetaexpress.com/feed/', 'Kosovë', 'Gazeta Express — lajme në kohë reale'),
  ('Zëri', 'zeri', 'https://zeri.info', 'https://zeri.info/rss/', 'Kosovë', 'Gazeta Zëri — lajme, politikë, ekonomi'),
  ('Lajmi', 'lajmi', 'https://lajmi.net', 'https://lajmi.net/feed/', 'Kosovë', 'Portal i lajmeve të fundit'),
  ('Dukagjini', 'dukagjini', 'https://www.dukagjini.com', 'https://www.dukagjini.com/feed/', 'Kosovë', 'Televizioni dhe portal Dukagjini'),
  ('Klan Kosova', 'klan-kosova', 'https://klankosova.tv', 'https://klankosova.tv/feed/', 'Kosovë', 'Televizioni Klan Kosova'),
  ('Bota Sot', 'bota-sot', 'https://botasot.info', 'https://botasot.info/rss/lajme', 'Kosovë', 'Bota Sot — lajme nga Kosova dhe bota'),
  ('Epoka e Re', 'epoka-e-re', 'https://www.epokaere.com', 'https://www.epokaere.com/feed/', 'Kosovë', 'Gazeta Epoka e Re'),
  ('Sinjali', 'sinjali', 'https://sinjali.com', 'https://sinjali.com/feed/', 'Kosovë', 'Portali Sinjali'),
  -- SHQIPËRIA
  ('BalkanWeb', 'balkanweb', 'https://www.balkanweb.com', 'https://www.balkanweb.com/feed/', 'Shqipëri', 'BalkanWeb — lajme nga Shqipëria dhe rajoni'),
  ('News24', 'news24', 'https://www.news24.al', 'https://www.news24.al/feed/', 'Shqipëri', 'Televizioni News 24'),
  ('Shekulli', 'shekulli', 'https://shekulli.com.al', 'https://shekulli.com.al/feed/', 'Shqipëri', 'Gazeta Shekulli'),
  ('Monitor', 'monitor', 'https://www.monitor.al', 'https://www.monitor.al/feed/', 'Shqipëri', 'Monitor — lajme ekonomike dhe biznesi'),
  ('ABC News', 'abc-news', 'https://abcnews.al', 'https://abcnews.al/feed/', 'Shqipëri', 'ABC News Albania'),
  ('Albeu', 'albeu', 'https://albeu.com', 'https://albeu.com/feed/', 'Shqipëri', 'Albeu — portal i lajmeve shqiptare'),
  ('Euronews Albania', 'euronews-albania', 'https://euronews.al', 'https://euronews.al/feed/', 'Shqipëri', 'Euronews Albania'),
  ('Insajderi', 'insajderi', 'https://insajderi.com', 'https://insajderi.com/feed/', 'Shqipëri', 'Insajderi — lajme dhe investigime'),
  -- MACEDONIA
  ('Portalb', 'portalb', 'https://portalb.mk', 'https://portalb.mk/feed/', 'Maqedoni', 'Portalb — lajme nga maqedonët shqiptarë'),
  ('Shenja TV', 'shenja-tv', 'https://shenja.tv', 'https://shenja.tv/feed/', 'Maqedoni', 'Shenja TV — televizion shqiptar në Maqedoni'),
  ('Argumentum', 'argumentum', 'https://argumentum.al', 'https://argumentum.al/feed/', 'Shqipëri', 'Argumentum — portal analitik')
on conflict (slug) do nothing;
