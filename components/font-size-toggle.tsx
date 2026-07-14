"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Type } from "lucide-react";

type FontScale = "normal" | "large" | "larger";

export function FontSizeToggle() {
  const [scale, setScale] = useState<FontScale>("normal");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lajme-font-scale") as FontScale;
    if (saved && ["normal", "large", "larger"].includes(saved)) {
      setScale(saved);
      applyScale(saved);
    }
  }, []);

  function applyScale(newScale: FontScale) {
    document.documentElement.classList.remove("font-scale-large", "font-scale-larger");
    if (newScale === "large") {
      document.documentElement.classList.add("font-scale-large");
    } else if (newScale === "larger") {
      document.documentElement.classList.add("font-scale-larger");
    }
  }

  function setAndApply(newScale: FontScale) {
    setScale(newScale);
    applyScale(newScale);
    localStorage.setItem("lajme-font-scale", newScale);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Popover menu */}
      {open && (
        <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-popover p-1.5 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => { setAndApply("normal"); setOpen(false); }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              scale === "normal"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <span className="text-[13px] font-bold leading-none">A</span>
            <span className="text-xs">Normal</span>
          </button>
          <button
            onClick={() => { setAndApply("large"); setOpen(false); }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              scale === "large"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <span className="text-[17px] font-bold leading-none">A</span>
            <span className="text-xs">E madhe</span>
          </button>
          <button
            onClick={() => { setAndApply("larger"); setOpen(false); }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              scale === "larger"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <span className="text-[22px] font-bold leading-none">A</span>
            <span className="text-xs">Shumë e madhe</span>
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110",
          scale !== "normal"
            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
            : "bg-popover text-foreground border border-border"
        )}
        title="Ndrysho madhësinë e shkronjave"
      >
        <Type className="h-5 w-5" />
      </button>
    </div>
  );
}