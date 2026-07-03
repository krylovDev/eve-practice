"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** Align <html> classes with OS/browser preference (Firefox-safe). */
export function applySystemThemeClass() {
  const root = document.documentElement;
  const resolved = window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
}

/**
 * next-themes uses deprecated MediaQueryList.addListener, which is unreliable
 * in Firefox. Re-sync when the user chose "system" and the preference changes.
 */
export function SystemThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    applySystemThemeClass();

    const media = window.matchMedia(MEDIA_QUERY);
    const onChange = () => {
      if (localStorage.getItem("theme") !== "system") {
        return;
      }
      applySystemThemeClass();
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return null;
}
