# lajme.postieri.xyz — Albanian News Aggregator

Agregator i lajmeve shqipe — mbledh lajmet nga 23+ portale shqipe nga Kosova, Shqipëria dhe Maqedonia.

## Stack

- **Next.js 16** (App Router, standalone output)
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (PostgreSQL database)
- **RSS Parser** (custom, regex-based XML parsing)
- **Docker** + **Coolify** deployment

## Quick Start

```bash
# Install deps
pnpm install

# Copy env
cp .env.example .env.local
# Fill in Supabase credentials

# Run SQL schema
# Execute supabase/schema.sql in Supabase SQL editor

# Dev
pnpm dev

# Build
pnpm build
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-cron-secret
```

## RSS Ingestion

Articles are fetched automatically via cron hitting:
```
GET /api/cron/ingest?secret=YOUR_CRON_SECRET
```

Or run manually:
```bash
curl "https://lajme.postieri.xyz/api/cron/ingest?secret=YOUR_SECRET"
```

## Sources (23)

### Kosovë (12)
Telegrafi, Koha Ditore, Indeksonline, Kallxo, Gazeta Express, Zëri, Lajmi, Dukagjini, Klan Kosova, Bota Sot, Epoka e Re, Sinjali

### Shqipëri (9)
BalkanWeb, News24, Shekulli, Monitor, ABC News, Albeu, Euronews Albania, Insajderi, Argumentum

### Maqedoni (2)
Portalb, Shenja TV

## License

© Postieri XYZ L.L.C.
