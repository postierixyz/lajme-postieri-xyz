/**
 * RSS Parser — Fetches and ingests articles from all sources
 * Used by the /api/cron/ingest route (called every 30 minutes)
 */

import { supabaseAdmin, type Source } from "@/lib/supabase";

// Category keywords for auto-classification (Albanian)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  politikë: [
    "parlament", "qeveri", "kryeministër", "deputet", "zgjedhje", "parti",
    "politika", "kishë", "diplomat", "president", "kuvend", "ministr",
    "BE", "bashkësisë evropiane", "negociata", "Serbi", "dialog", "politike",
    "psd", "pd", "pdk", "ldk", "vv", "aket", "vetëvendosje", "demokratik",
    "socialist", "ramë", "kurti", "begaj", "osmani", "spahiu",
  ],
  ekonomi: [
    "ekonomi", "biznes", "investim", "bankë", "euro", "buxhet", "tatim",
    "gdp", "blerje", "shitje", "tregti", "punesim", "papunesia", "pagë",
    "inflacion", "bursë", "financa", "kompani", "ndërmarrje", "taksë",
    "bujqësi", "energji", "KEK", "KEDS", "internet", "telekom",
  ],
  sport: [
    "futboll", "basketboll", "tenis", "sport", "lojtar", "trajner",
    "kombëtarja", "ligë", "kampionat", "gol", "ndeshje", "stadium",
    "olimpiadë", "garë", "Dritëro", "Trepça", "Prishtina", "Llap",
    "Kosova", "Shqipëria", "fifa", "uefa", "champions",
  ],
  kulturë: [
    "kulturë", "art", "muzikë", "film", "teatër", "ekspozitë",
    "festival", "libër", "letrar", "këngë", "koncert", "valle",
    "folklor", "trashëgimi", "monument", "muze", "galeri",
    "Escobar", "Kayne", "West", "Rita Ora", "Dua Lipa", "Era Istrefi",
  ],
  teknologji: [
    "teknologji", "app", "software", "hardware", "internet", "digital",
    "AI", "artificial intelligence", "startup", "kod", "programim",
    "kompjuter", "smartphone", "apple", "google", "microsoft", "meta",
    "facebook", "instagram", "tiktok", "chatgpt", "openai", "tesla",
  ],
  bota: [
    "bota", "evropë", "amerikë", "azisë", "afrikë", "lindje",
    "ukrainë", "rusi", "kinë", "trump", "shtetet e bashkuara",
    "gazë", "izrael", "pacifi", "nato", "okb", "luftë", "konflikt",
    "trump", "putin", "zelensky", "netanyahu", "macron", "starmer",
  ],
};

function classifyCategory(title: string, excerpt: string): string {
  const text = `${title} ${excerpt}`.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) scores[cat]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "të tjera";
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#a-zA-Z0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function extractImage(itemXml: string): string | null {
  // Try media:content, media:thumbnail, enclosures, and og:image patterns
  const patterns = [
    /<media:content[^>]*url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
    /<enclosure[^>]*url=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = itemXml.match(p);
    if (m && m[1].startsWith("http")) return m[1];
  }
  return null;
}

interface ParsedItem {
  title: string;
  url: string;
  guid: string;
  excerpt: string;
  image_url: string | null;
  published_at: string | null;
  author: string | null;
}

function parseRssXml(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // Match <item> blocks (RSS 2.0)
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    if (!match) continue;
    const block = match[1];

    // Title
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? stripHtml(titleMatch[1]) : "";
    if (!title) continue;

    // Link/URL
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
      || block.match(/<link[^>]*href=["']([^"']+)["']/i);
    const url = linkMatch ? linkMatch[1].trim() : "";

    // GUID
    const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const guid = guidMatch ? guidMatch[1].trim() : url;

    if (!url && !guid) continue;

    // Description/excerpt
    const descMatch = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const excerpt = descMatch ? stripHtml(descMatch[1]) : "";

    // Image
    const image_url = extractImage(block);

    // Date
    const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
      || block.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
    let published_at: string | null = null;
    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!isNaN(d.getTime())) {
        published_at = d.toISOString();
      }
    }

    // Author
    const authorMatch = block.match(/<(?:dc:)?creator[^>]*>([\s\S]*?)<\/(?:dc:)?creator>/i)
      || block.match(/<author[^>]*>([\s\S]*?)<\/author>/i);
    const author = authorMatch ? stripHtml(authorMatch[1]) : null;

    items.push({
      title: title.slice(0, 300),
      url: url || guid,
      guid,
      excerpt,
      image_url,
      published_at,
      author,
    });
  }

  return items;
}

async function fetchFeed(rssUrl: string): Promise<string> {
  const res = await fetch(rssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Scrape the full article text from the original source URL.
 * Uses og:description and meta description as fallback, then tries to
 * extract structured text content from the page.
 */
async function scrapeFullContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    
    const html = await res.text();
    
    // STRATEGY 1: Extract article body first (richest content)
    // Albanian news sites use: <article>, <div class="content">, <div class="post-content">,
    // <div class="single-content">, <div class="entry-content">, <div class="article-body">
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
      || html.match(/<div[^>]+(?:class|id)=["'][^"']*(?:article-content|post-content|content-body|main-content|single-content|entry-content|article-body|artikulli-content|teksti-lajmit)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<div[^>]+(?:class|id)=["'][^"']*(?:content|entry|single-post|post|article)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    
    if (articleMatch) {
      let content = articleMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      if (content.length > 300) {
        return content.slice(0, 8000);
      }
    }

    // STRATEGY 2: og:description (medium quality, usually 150-350 chars)
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
    if (ogDesc && ogDesc[1] && ogDesc[1].length > 150) {
      return ogDesc[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
    }

    // STRATEGY 3: meta description
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    if (metaDesc && metaDesc[1] && metaDesc[1].length > 150) {
      return metaDesc[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Scrape full content for articles that don't have it yet.
 * This runs after initial RSS ingestion to enrich articles.
 */
export async function enrichArticles(): Promise<number> {
  // Get articles from last 24 hours that don't have full_content yet
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("id, url")
    .is("full_content", null)
    .gte("created_at", oneDayAgo)
    .limit(20);

  if (!articles?.length) return 0;

  let enriched = 0;
  for (const art of articles) {
    const content = await scrapeFullContent(art.url);
    if (content) {
      await supabaseAdmin
        .from("articles")
        .update({ full_content: content })
        .eq("id", art.id);
      enriched++;
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  return enriched;
}

export async function ingestAllFeeds(): Promise<{
  sourcesProcessed: number;
  articlesInserted: number;
  errors: string[];
}> {
  const { data: sources, error } = await supabaseAdmin
    .from("sources")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;

  let articlesInserted = 0;
  const errors: string[] = [];

  for (const source of sources as Source[]) {
    try {
      const xml = await fetchFeed(source.rss_url);
      const items = parseRssXml(xml);

      if (items.length === 0) {
        errors.push(`${source.name}: No items parsed`);
        continue;
      }

      // Prepare articles for insert
      const articlesToInsert = items.map((item) => ({
        source_id: source.id,
        title: item.title,
        url: item.url,
        excerpt: item.excerpt,
        image_url: item.image_url,
        category: classifyCategory(item.title, item.excerpt),
        author: item.author,
        published_at: item.published_at,
        guid: item.guid,
      }));

      // Insert with upsert (dedupe by source_id + guid)
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("articles")
        .upsert(articlesToInsert, {
          onConflict: "source_id,guid",
          ignoreDuplicates: true,
        })
        .select();

      if (insertError) {
        errors.push(`${source.name}: ${insertError.message}`);
      } else {
        articlesInserted += inserted?.length || 0;
      }

      // Update last fetched time
      await supabaseAdmin
        .from("sources")
        .update({ last_fetched_at: new Date().toISOString(), fetch_error: null })
        .eq("id", source.id);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(`${source.name}: ${errMsg}`);
      await supabaseAdmin
        .from("sources")
        .update({ fetch_error: errMsg })
        .eq("id", source.id);
    }
  }

  return {
    sourcesProcessed: sources.length,
    articlesInserted,
    errors,
  };
}

// Cleanup old articles — keep all of 2026, delete older than Jan 1 2026
// On January 2027, this removes all 2026 articles (fresh start)
export async function cleanupOldArticles(): Promise<number> {
  // Keep everything from 2026 onwards (cutoff = Jan 1 2026)
  const cutoff = new Date("2026-01-01T00:00:00Z");

  const { count } = await supabaseAdmin
    .from("articles")
    .delete({ count: "exact" })
    .lt("published_at", cutoff.toISOString());

  return count || 0;
}
