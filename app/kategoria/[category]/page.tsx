import { supabase } from "@/lib/supabase";
import { ArticleCard } from "@/components/article-card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 600;

const CATEGORY_LABELS: Record<string, string> = {
  "politikë": "Politikë",
  "ekonomi": "Ekonomi",
  "sport": "Sport",
  "kulturë": "Kulturë",
  "teknologji": "Teknologji",
  "bota": "Bota",
  "të tjera": "Të Tjera",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const label = CATEGORY_LABELS[decoded] || decoded;
  return {
    title: `Lajme ${label}`,
    description: `Të gjitha lajmet nga kategoria ${label} — nga portalet kryesore shqipe.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);

  const { data: articles } = await supabase
    .from("v_latest_articles")
    .select("*")
    .eq("category", decoded)
    .order("published_at", { ascending: false })
    .limit(48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold capitalize">{decoded}</h1>
        <p className="text-sm text-muted-foreground">
          {articles?.length || 0} artikuj në këtë kategori
        </p>
      </div>

      {/* Category nav */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
          <Link key={slug} href={`/kategoria/${encodeURIComponent(slug)}`}>
            <Badge variant={decoded === slug ? "default" : "secondary"} className="cursor-pointer">
              {label}
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
          <p>Nuk ka artikuj në këtë kategori për momentin.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            ← Kthehu në ballinë
          </Link>
        </div>
      )}
    </div>
  );
}
