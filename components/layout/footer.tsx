import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Lajme Postieri</span>
            <span className="text-xs text-muted-foreground">
              · Agregator i lajmeve shqipe
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {new Date().toLocaleDateString("sq-AL", { year: "numeric" })} ·
            </span>
            <Link href="/burimet" className="hover:text-foreground">
              Burimet
            </Link>
            <Link href="/arkivi/2026" className="hover:text-foreground">
              Arkivi
            </Link>
            <Link href="https://postieri.xyz" className="hover:text-foreground">
              Postieri XYZ
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Të drejtat e artikujve i përkasin burimeve origjinale. Lajme Postieri
          është agregator dhe nuk riprodhon përmbajtjen.
        </p>
      </div>
    </footer>
  );
}
