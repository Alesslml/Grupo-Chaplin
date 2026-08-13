import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "chaplin_survey_theme";
export type SurveyTheme = "dark" | "light";

export function useSurveyTheme(): [SurveyTheme, () => void] {
  const [theme, setTheme] = useState<SurveyTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return [theme, toggle];
}

export function ThemeToggle({ theme, onToggle }: { theme: SurveyTheme; onToggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="relative w-14 h-8 border-2 shrink-0 transition-colors duration-300"
      style={{ borderColor: "var(--rojo)", background: "var(--t-card)" }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-rojo flex items-center justify-center transition-all duration-300"
        style={{ left: isDark ? "3px" : "calc(100% - 23px)" }}
      >
        {isDark ? <Moon size={11} className="text-negro" /> : <Sun size={11} className="text-negro" />}
      </span>
    </button>
  );
}
