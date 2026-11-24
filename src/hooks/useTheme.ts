import { useCallback, useEffect, useRef, useState } from "react";
import { readStoredTheme, writeStoredTheme } from "../lib/storage";
import type { Theme } from "../lib/types";

function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme());
  const firstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    writeStoredTheme(theme);

    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    // Suppress the global colour transitions for one frame so the theme
    // changes as a single deliberate step rather than a smear.
    root.classList.add("theme-switching");
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => root.classList.remove("theme-switching"));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      root.classList.remove("theme-switching");
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
