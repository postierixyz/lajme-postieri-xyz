"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, Newspaper, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const NAV_LINKS = [
  { href: "/", label: "Ballina" },
  { href: "/kategoria/politikë", label: "Politikë" },
  { href: "/kategoria/ekonomi", label: "Ekonomi" },
  { href: "/kategoria/sport", label: "Sport" },
  { href: "/kategoria/kulturë", label: "Kulturë" },
  { href: "/kategoria/teknologji", label: "Teknologji" },
  { href: "/kategoria/bota", label: "Bota" },
  { href: "/arkivi/2026", label: "Arkivi" },
  { href: "/burimet", label: "Burimet" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top bar */}
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="hidden sm:block font-medium tracking-wide">
            {new Date().toLocaleDateString("sq-AL", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </span>
          <span className="font-semibold uppercase tracking-widest">
            Agregatori i Lajmeve Shqipe
          </span>
          <span className="hidden sm:block">
            Kosovë · Shqipëri · Maqedoni
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={buttonVariants({ variant: "ghost", size: "icon" }) + " md:hidden"}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-accent rounded-md"
                >
                  <Newspaper className="h-4 w-4" />
                  Ballina
                </Link>
                {NAV_LINKS.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2.5 text-sm font-medium hover:bg-accent rounded-md capitalize",
                      isActive(link.href) && "bg-accent text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Newspaper className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">Lajme</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Postieri
              </span>
            </div>
          </Link>
        </div>

        {/* Search */}
        <form
          action="/kerko"
          className="relative hidden flex-1 max-w-md sm:flex"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            name="q"
            placeholder="Kërko lajme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </form>

        {/* Desktop nav is below */}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:block border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border-b-2",
                isActive(link.href)
                  ? "border-primary text-foreground"
                  : "border-transparent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
