import { supabase } from "@/lib/supabase";
import { ArticleCard } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Archive } from "lucide-react";

export const revalidate = 600;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Arkiva ${year}`,
    description: `Arkiva e lajmeve nga viti ${year} — Lajme Postieri`,
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();

  // Fetch articles for this year
  const { data: articles } = await supabase
    .from("v_latest_articles")
    .select("*")
    .eq("year", year)
    .order("published_at", { ascending: false })
    .limit(60);

  // Get year list (2026+)
  const years = [];
  for (let y = 2026; y <= currentYear; y++) {
    years.push(y);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Ballina
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Archive className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Arkiva</h1>
        </div>
        <span className="text-sm text-muted-foreground">
          {articles?.length || 0} artikuj nga viti {year}
        </span>
      </div>

      {/* Year selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {years.map((y) => (
          <Link key={y} href={`/arkivi/${y}`}>
            <Badge variant={y === year ? "default" : "secondary"} className="cursor-pointer text-sm px-3 py-1">
              {y}
            </Badge>
          </Link>
        ))}
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
          <Archive className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg">Nuk ka artikuj në arkivë për vitin {year}.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            ← Kthehu në ballinë
          </Link>
        </div>
      )}
    </div>
  );
}