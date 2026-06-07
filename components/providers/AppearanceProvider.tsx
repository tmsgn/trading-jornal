"use client";

import { useEffect, useState } from "react";

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccent] = useState("#6366f1"); // Default Indigo
  const [theme, setTheme] = useState("Light");
  const [layout, setLayout] = useState("Comfortable");

  useEffect(() => {
    const syncAppearance = () => {
      setAccent(localStorage.getItem("tz_accent") || "#6366f1");
      setTheme(localStorage.getItem("tz_theme") || "Light");
      setLayout(localStorage.getItem("tz_layout") || "Comfortable");
    };

    // Initial load
    syncAppearance();

    // Listen for custom events triggered by settings page
    window.addEventListener("tz_appearance_change", syncAppearance);
    return () => window.removeEventListener("tz_appearance_change", syncAppearance);
  }, []);

  useEffect(() => {
    // Apply Theme
    if (theme === "Dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply Layout
    document.body.classList.remove("layout-compact", "layout-comfortable", "layout-spacious");
    document.body.classList.add(`layout-${layout.toLowerCase()}`);
  }, [theme, layout]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* CSS Variables Override */
          :root {
            --theme-accent: ${accent};
          }
          
          /* Force Tailwind overrides for the dynamic accent */
          .text-indigo-600 { color: ${accent} !important; }
          .bg-indigo-600 { background-color: ${accent} !important; }
          .border-indigo-600 { border-color: ${accent} !important; }
          .hover\\:text-indigo-600:hover { color: ${accent} !important; }
          .hover\\:bg-indigo-50:hover { background-color: ${accent}15 !important; }
          .focus\\:ring-indigo-500:focus { --tw-ring-color: ${accent} !important; box-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important; }
          
          /* Custom App Components Override */
          .tz-btn-primary {
            background: linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%) !important;
          }
          .tz-tab-active {
            border-bottom-color: ${accent} !important;
            color: ${accent} !important;
          }
          .tz-nav-item.active {
            background: ${accent}25 !important;
            color: ${accent} !important;
          }
        `
      }} />
      {children}
    </>
  );
}
