"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState(false);

  // Instantly toggle theme without triggering 100s of CSS transition calculations across DOM
  const applyThemeClass = useCallback((newTheme: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Temporarily disable CSS transitions on the page during the theme flip
    const css = document.createElement("style");
    css.appendChild(
      document.createTextNode(
        "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
      )
    );
    document.head.appendChild(css);

    if (newTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }

    // Force style flush and remove the temporary rule on the next frame so hover effects continue working
    void window.getComputedStyle(root).opacity;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (css.parentNode) {
          document.head.removeChild(css);
        }
      });
    });
  }, []);

  useEffect(() => {
    setIsMounted(true);
    // Leer tema persistido en cookie o localStorage
    const savedTheme = (typeof document !== "undefined" &&
      document.cookie.match(/theme=([^;]+)/)?.[1]) as Theme | undefined;

    const initialTheme: Theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";

    setThemeState(initialTheme);
    applyThemeClass(initialTheme);
  }, [applyThemeClass]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyThemeClass(newTheme);
      if (typeof document !== "undefined") {
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
        try {
          localStorage.setItem("taptrade_theme", newTheme);
        } catch {}
      }
    },
    [applyThemeClass]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      const nextTheme: Theme = prevTheme === "dark" ? "light" : "dark";
      applyThemeClass(nextTheme);
      if (typeof document !== "undefined") {
        document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
        try {
          localStorage.setItem("taptrade_theme", nextTheme);
        } catch {}
      }
      return nextTheme;
    });
  }, [applyThemeClass]);

  const value = useMemo(
    () => ({
      theme,
      isLight: isMounted && theme === "light",
      toggleTheme,
      setTheme,
    }),
    [theme, isMounted, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

