"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "theme";

// Runs before first paint (see the root layout) so the saved theme never flashes.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // The choice still applies for this visit when storage is unavailable.
    }
    setDark(next);
  };

  const Icon = dark ? SunIcon : MoonIcon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Koyu tema"
      aria-pressed={dark}
      title={dark ? "Açık temaya geç" : "Koyu temaya geç"}
      className="inline-flex size-11 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}
