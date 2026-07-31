import { useState, useCallback, useEffect } from 'react';
import { loadTheme, saveTheme } from '../utils/storage';
import { LIGHT_COLORS, DARK_COLORS } from '../utils/constants';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(themePreference) {
  if (themePreference === 'system') {
    return getSystemTheme();
  }
  return themePreference;
}

export function useTheme() {
  const [themePreference, setThemePreference] = useState(() => loadTheme() || 'system');
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme = resolveTheme(themePreference);
  const colors = resolvedTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    // Set CSS custom properties for Material Design tokens
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--md-${key}`, value);
    });

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.background);
    }
  }, [colors, resolvedTheme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setThemePreference((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  }, []);

  // Set specific theme preference
  const setTheme = useCallback((preference) => {
    setThemePreference(preference);
    saveTheme(preference);
  }, []);

  return {
    themePreference,
    resolvedTheme,
    colors,
    isDark: resolvedTheme === 'dark',
    toggleTheme,
    setTheme,
  };
}