import { supabase } from "@/lib/supabase";
import { ArticleCard } from "@/components/article-card";
import { Separator } from "@/components/ui/separator";

export const revalidate = 300;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  let articles: any[] = [];

  if (query.length >= 2) {
    const { data } = await supabase
      .from("v_latest_articles")
      .select("*")
      .textSearch("title", query, {
        type: "websearch",
        config: "simple",
      })
      .order("published_at", { ascending: false })
      .limit(48);

    articles = data || [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {query ? `Rezultatet për: "${query}"` : "Kërkim"}
        </h1>
        {query && (
          <p className="text-sm text-muted-foreground">
            {articles.length} rezultate
          </p>
        )}
      </div>

      <Separator className="mb-6" />

      {articles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : query ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>Nuk u gjetën rezultate për "{query}".</p>
          <p className="mt-2 text-sm">Provoni me fjalë kyçe të tjera.</p>
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <p>Shkruani diçka për të kërkuar.</p>
        </div>
      )}
    </div>
  );
}
