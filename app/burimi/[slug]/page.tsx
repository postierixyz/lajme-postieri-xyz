import { supabase } from "@/lib/supabase";
import { ArticleCard } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 600;
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: source } = await supabase
    .from("sources")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return {
    title: source?.name || "Burim",
    description: source?.description || `Lajme nga ${source?.name}`,
  };
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: source } = await supabase
    .from("sources")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!source) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Burimi nuk u gjet</h1>
        <Link href="/burimet" className="mt-4 inline-block text-primary hover:underline">
          ← Shiko të gjitha burimet
        </Link>
      </div>
    );
  }

  const { data: articles } = await supabase
    .from("v_latest_articles")
    .select("*")
    .eq("source_slug", slug)
    .order("published_at", { ascending: false })
    .limit(48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Source header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{source.name}</h1>
          <Badge variant="secondary">{source.region}</Badge>
        </div>
        {source.description && (
          <p className="mt-1 text-sm text-muted-foreground">{source.description}</p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Link href={source.website_url} target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline">
            {source.website_url.replace("https://", "").replace("www.", "")}
          </Link>
          {source.last_fetched_at && (
            <span>
              · Përditësuar:{" "}
              {new Date(source.last_fetched_at).toLocaleString("sq-AL")}
            </span>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {articles && articles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article: any) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>Nuk ka artikuj nga ky burim për momentin.</p>
        </div>
      )}
    </div>
  );
}