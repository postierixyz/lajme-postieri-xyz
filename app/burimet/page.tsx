import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burimet e Lajmeve",
  description: "Të gjitha portalet shqipe të lajmeve të agreguara në Lajme Postieri.",
};

export const revalidate = 600;

export default async function SourcesPage() {
  const { data: sources } = await supabase
    .from("v_source_stats")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Group by region
  const grouped: Record<string, any[]> = {};
  for (const s of sources || []) {
    if (!grouped[s.region]) grouped[s.region] = [];
    grouped[s.region].push(s);
  }

  const regionOrder = ["Kosovë", "Shqipëri", "Maqedoni"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Burimet</h1>
        <p className="text-sm text-muted-foreground">
          {sources?.length || 0} portale shqipe të lajmeve
        </p>
      </div>

      <Separator className="mb-6" />

      {regionOrder.map((region) => {
        const regionSources = grouped[region];
        if (!regionSources || regionSources.length === 0) return null;

        return (
          <section key={region} className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Badge variant="secondary">{region}</Badge>
              <span className="text-sm text-muted-foreground">
                ({regionSources.length} burime)
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {regionSources.map((source) => (
                <Link
                  key={source.id}
                  href={`/burimi/${source.slug}`}
                  className="group rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold group-hover:text-primary">
                      {source.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {source.article_count} artikuj
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
