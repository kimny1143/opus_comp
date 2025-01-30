'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // システムの設定を確認
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // システムの設定変更を監視
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  return (
    <SettingsContext.Provider value={{ reducedMotion, toggleReducedMotion }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 