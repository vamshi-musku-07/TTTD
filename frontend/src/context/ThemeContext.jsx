import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'tttd_mediaflow_theme';
const SIDEBAR_KEY = 'tttd_sidebar_collapsed';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setMobileNavOpen((o) => !o);
    } else {
      setSidebarCollapsed((c) => !c);
    }
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      closeMobileNav,
    }),
    [theme, sidebarCollapsed, mobileNavOpen]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
