import { supabase } from "@/lib/supabase";
import { ArticleCard } from "@/components/article-card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Article, Source } from "@/lib/supabase";

// Revalidate every 10 minutes
export const revalidate = 600;

interface HomeProps {
  searchParams: Promise<{ rajoni?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const region = params.rajoni;

  // Fetch latest articles (all or by region)
  let articlesQuery = supabase
    .from("v_latest_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(60);

  if (region && region !== "të gjitha") {
    articlesQuery = articlesQuery.eq("source_region", region);
  }

  const { data: articles } = await articlesQuery;

  // Fetch sources for sidebar
  const { data: sources } = await supabase
    .from("v_source_stats")
    .select("*")
    .eq("is_active", true)
    .order("article_count", { ascending: false });

  // Group articles by category for sections
  const allArticles = (articles || []) as unknown as (Article & {
    source_region: string;
  })[];

  // Featured = first article with image
  const featured = allArticles.find((a) => a.image_url) || allArticles[0];
  const topStories = allArticles.filter((a) => a.id !== featured?.id).slice(0, 6);
  const restArticles = allArticles.filter(
    (a) => a.id !== featured?.id && !topStories.includes(a)
  );

  // Group by category for category sections
  const categoryGroups: Record<string, typeof allArticles> = {};
  for (const art of restArticles) {
    if (!categoryGroups[art.category]) categoryGroups[art.category] = [];
    if (categoryGroups[art.category].length < 4) {
      categoryGroups[art.category].push(art);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Region filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Rajoni:</span>
        <Link href="/">
          <Badge
            variant={!region || region === "të gjitha" ? "default" : "secondary"}
            className="cursor-pointer"
          >
            Të gjitha
          </Badge>
        </Link>
        {(["Kosovë", "Shqipëri", "Maqedoni"] as const).map((r) => (
          <Link key={r} href={`/?rajoni=${encodeURIComponent(r)}`}>
            <Badge variant={region === r ? "default" : "secondary"} className="cursor-pointer">
              {r}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Hero section: featured + top stories */}
      {featured && (
        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ArticleCard article={featured} variant="featured" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
              Më të lexuarat
            </h2>
            <Separator />
            {topStories.slice(0, 5).map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* Main grid + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Article grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Lajmet e fundit</h2>
            <span className="text-xs text-muted-foreground">
              {allArticles.length} artikuj
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topStories.slice(1).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {restArticles.slice(0, 12).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Sources */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Burimet
            </h2>
            <Separator className="mb-3" />
            <div className="space-y-1">
              {(sources || []).slice(0, 15).map((source: any) => (
                <Link
                  key={source.id}
                  href={`/burimi/${source.slug}`}
                  className="group flex items-center justify-between rounded-md px-2 py-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium group-hover:text-primary">
                      {source.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {source.region}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {source.article_count}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/burimet"
              className="mt-2 block text-center text-xs text-primary hover:underline"
            >
              Shiko të gjitha burimet →
            </Link>
          </div>

          {/* Category sections */}
          {Object.entries(categoryGroups).slice(0, 3).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground capitalize">
                {cat}
              </h2>
              <Separator className="mb-3" />
              <div className="space-y-1">
                {items.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
              <Link
                href={`/kategoria/${encodeURIComponent(cat)}`}
                className="mt-2 block text-center text-xs text-primary hover:underline"
              >
                Më shumë {cat} →
              </Link>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
