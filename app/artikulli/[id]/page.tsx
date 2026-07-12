import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Clock, Newspaper, Tag } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { format, formatDistanceToNow } from "date-fns";
import { sq } from "date-fns/locale";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: article } = await supabase
    .from("v_latest_articles")
    .select("title, excerpt, source_name")
    .eq("id", id)
    .single();

  return {
    title: article?.title || "Artikulli",
    description: article?.excerpt?.slice(0, 160) || "Lexo artikullin në Lajme Postieri",
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: article } = await supabase
    .from("v_latest_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Artikulli nuk u gjet</h1>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          ← Kthehu në ballinë
        </Link>
      </div>
    );
  }

  const publishedDate = article.published_at || article.created_at;
  const timeAgo = formatDistanceToNow(new Date(publishedDate), {
    addSuffix: true,
    locale: sq,
  });
  const formattedDate = format(new Date(publishedDate), "d MMMM yyyy, HH:mm", {
    locale: sq,
  });

  // Fetch related articles from the same source
  const { data: related } = await supabase
    .from("v_latest_articles")
    .select("id, title, published_at, source_name")
    .eq("source_slug", article.source_slug)
    .neq("id", id)
    .order("published_at", { ascending: false })
    .limit(4);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Ballina
        </Link>
        <span>/</span>
        <Link
          href={`/burimi/${article.source_slug}`}
          className="hover:text-foreground transition-colors"
        >
          {article.source_name}
        </Link>
      </div>

      {/* Article header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="default" className="capitalize">
            {article.category}
          </Badge>
          <Badge variant="outline">{article.source_region}</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
          {article.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link
            href={`/burimi/${article.source_slug}`}
            className="flex items-center gap-1.5 font-medium text-primary hover:underline"
          >
            <Newspaper className="h-4 w-4" />
            {article.source_name}
          </Link>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {article.category}
          </span>
        </div>
      </header>

      <Separator className="mb-8" />

      {/* Article image */}
      {article.image_url && (
        <div className="mb-8 overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Article content */}
      <div className="prose prose-neutral prose-lg max-w-none">
        {article.excerpt ? (
          <p className="text-lg leading-relaxed text-foreground/90">
            {article.excerpt}
          </p>
        ) : (
          <p className="text-muted-foreground italic">
            Ky artikull nuk ka përmbajtje të detajuar në burimin RSS.
          </p>
        )}
      </div>

      <Separator className="my-8" />

      {/* Read on original source */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold">
              Artikulli i plotë në {article.source_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Agregatori ynë shfaq përmbajtjen e disponueshme në burimin RSS.
            </p>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Lexo artikullin e plotë
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Related articles */}
      {related && related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">
            Më shumë nga {article.source_name}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.slice(0, 4).map((r: any) => (
              <Link
                key={r.id}
                href={`/artikulli/${r.id}`}
                className="group rounded-lg border border-border bg-card p-3 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {r.title}
                </p>
                <span className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(r.published_at || article.created_at), {
                    addSuffix: true,
                    locale: sq,
                  })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to top */}
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu në ballinë
        </Link>
      </div>
    </article>
  );
}