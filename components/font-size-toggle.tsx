"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type FontScale = "normal" | "large" | "larger";

export function FontSizeToggle() {
  const [scale, setScale] = useState<FontScale>("normal");

  useEffect(() => {
    const saved = localStorage.getItem("lajme-font-scale") as FontScale;
    if (saved && ["normal", "large", "larger"].includes(saved)) {
      setScale(saved);
      applyScale(saved);
    }
  }, []);

  function applyScale(newScale: FontScale) {
    // Remove all scale classes first
    document.documentElement.classList.remove("font-scale-large", "font-scale-larger");
    
    if (newScale === "large") {
      document.documentElement.classList.add("font-scale-large");
    } else if (newScale === "larger") {
      document.documentElement.classList.add("font-scale-larger");
    }
  }

  function cycleScale() {
    const next: Record<FontScale, FontScale> = {
      normal: "large",
      large: "larger",
      larger: "normal",
    };
    const newScale = next[scale];
    setScale(newScale);
    applyScale(newScale);
    localStorage.setItem("lajme-font-scale", newScale);
  }

  return (
    <button
      onClick={cycleScale}
      className="flex items-center gap-0.5 rounded-md border border-border px-2 py-1 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      title={`Madhësia e shkronjave: ${scale === "normal" ? "Normale" : scale === "large" ? "E madhe" : "Shumë e madhe"}`}
    >
      <span className={cn(
        "leading-none",
        scale === "normal" && "text-[10px]",
        scale === "large" && "text-[10px]",
        scale === "larger" && "text-[10px]"
      )}>A</span>
      <span className={cn(
        "leading-none",
        scale === "normal" && "text-xs",
        scale === "large" && "text-sm font-semibold text-primary",
        scale === "larger" && "text-sm"
      )}>A</span>
      <span className={cn(
        "leading-none",
        scale === "normal" && "text-sm",
        scale === "large" && "text-sm",
        scale === "larger" && "text-lg font-semibold text-primary"
      )}>A</span>
    </button>
  );
}
