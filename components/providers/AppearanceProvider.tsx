"use client";

import { useEffect, useState, useCallback } from "react";
import { getPreferencesAction } from "@/app/actions/settings";

interface AppearanceState {
  theme: "Light" | "Dark" | "System";
  accent: string;
  layout: "Compact" | "Comfortable" | "Spacious";
}

const DEFAULTS: AppearanceState = {
  theme: "Light",
  accent: "#6366f1",
  layout: "Comfortable",
};

function getSystemTheme(): "Light" | "Dark" {
  if (typeof window === "undefined") return "Light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "Dark"
    : "Light";
}

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AppearanceState>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage first (instant), then sync from Supabase
  useEffect(() => {
    // 1. Instant load from localStorage
    const localTheme = localStorage.getItem("tz_theme") as AppearanceState["theme"] | null;
    const localAccent = localStorage.getItem("tz_accent");
    const localLayout = localStorage.getItem("tz_layout") as AppearanceState["layout"] | null;

    const initialState: AppearanceState = {
      theme: localTheme || DEFAULTS.theme,
      accent: localAccent || DEFAULTS.accent,
      layout: localLayout || DEFAULTS.layout,
    };
    setState(initialState);
    setMounted(true);

    // 2. Background sync from Supabase (source of truth)
    getPreferencesAction()
      .then((prefs) => {
        if (prefs && Object.keys(prefs).length > 0) {
          const dbState: AppearanceState = {
            theme: prefs.tz_theme || initialState.theme,
            accent: prefs.tz_accent || initialState.accent,
            layout: prefs.tz_layout || initialState.layout,
          };
          setState(dbState);
          // Sync DB values to localStorage for next instant load
          localStorage.setItem("tz_theme", dbState.theme);
          localStorage.setItem("tz_accent", dbState.accent);
          localStorage.setItem("tz_layout", dbState.layout);
        }
      })
      .catch(() => {
        // Silently fail — localStorage values are fine as fallback
      });
  }, []);

  // Listen for settings page changes (custom event)
  const handleAppearanceChange = useCallback(() => {
    const newState: AppearanceState = {
      theme: (localStorage.getItem("tz_theme") as AppearanceState["theme"]) || DEFAULTS.theme,
      accent: localStorage.getItem("tz_accent") || DEFAULTS.accent,
      layout: (localStorage.getItem("tz_layout") as AppearanceState["layout"]) || DEFAULTS.layout,
    };
    setState(newState);
  }, []);

  useEffect(() => {
    window.addEventListener("tz_appearance_change", handleAppearanceChange);
    return () =>
      window.removeEventListener("tz_appearance_change", handleAppearanceChange);
  }, [handleAppearanceChange]);

  // Listen for system theme changes when theme is "System"
  useEffect(() => {
    if (state.theme !== "System") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setState((s) => ({ ...s })); // trigger re-render
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [state.theme]);

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return;

    const resolvedTheme =
      state.theme === "System" ? getSystemTheme() : state.theme;

    if (resolvedTheme === "Dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply layout density
    document.body.classList.remove(
      "layout-compact",
      "layout-comfortable",
      "layout-spacious",
    );
    document.body.classList.add(`layout-${state.layout.toLowerCase()}`);
  }, [state.theme, state.layout, mounted]);

  // CSS variable overrides for accent color
  const accentCSS = mounted
    ? `
    :root {
      --tz-accent: ${state.accent};
      --tz-accent-muted: ${state.accent}20;
    }
    .dark {
      --tz-accent: ${state.accent};
      --tz-accent-muted: ${state.accent}25;
    }
  `
    : "";

  return (
    <>
      {mounted && <style dangerouslySetInnerHTML={{ __html: accentCSS }} />}
      {children}
    </>
  );
}
