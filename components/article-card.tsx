import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { sq } from "date-fns/locale";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "featured" | "horizontal";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const publishedDate = article.published_at || article.created_at;
  const timeAgo = formatDistanceToNow(new Date(publishedDate), {
    addSuffix: true,
    locale: sq,
  });

  // Compact: small card, no image
  if (variant === "compact") {
    return (
      <Link
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-1 p-2 rounded-md hover:bg-accent/50 transition-colors"
      >
        <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{article.source_name}</span>
          <span>·</span>
          <span>{timeAgo}</span>
        </div>
      </Link>
    );
  }

  // Horizontal: image left, text right
  if (variant === "horizontal") {
    return (
      <Link
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 p-2 rounded-md hover:bg-accent/50 transition-colors"
      >
        {article.image_url && (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover"
              loading="lazy"}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center gap-1">
          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{article.source_name}</span>
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Featured: large card
  if (variant === "featured") {
    return (
      <Link
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all"
      >
        {article.image_url && (
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"}
            />
          </div>
        )}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize text-xs">
              {article.category}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {article.source_name}
            </span>
          </div>
          <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </Link>
    );
  }

  // Default: standard card
  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all"
    >
      {article.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url}
            alt={article.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-xs">
            {article.category}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {article.source_name}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <span className="mt-auto text-xs text-muted-foreground pt-1">{timeAgo}</span>
      </div>
    </Link>
  );
}