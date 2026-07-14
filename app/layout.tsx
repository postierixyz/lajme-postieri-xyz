import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FontSizeToggle } from "@/components/font-size-toggle";

export const metadata: Metadata = {
  title: {
    default: "Lajme Postieri — Agregatori i Lajmeve Shqipe",
    template: "%s | Lajme Postieri",
  },
  description:
    "Të gjitha lajmet shqipe në një vend. Portalet kryesore nga Kosova, Shqipëria dhe Maqedonia.",
  keywords: [
    "lajme", "kosovë", "shqipëri", "lajme shqip", "news aggregator",
    "kosova news", "albanian news", "lajme online",
  ],
  openGraph: {
    title: "Lajme Postieri — Agregatori i Lajmeve Shqipe",
    description: "Të gjitha lajmet shqipe në një vend.",
    type: "website",
    locale: "sq_AL",
    siteName: "Lajme Postieri",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <FontSizeToggle />
      </body>
    </html>
  );
}
