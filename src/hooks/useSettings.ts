
import { useState, useEffect } from 'react';

export interface SchoolSettings {
  schoolName: string;
  schoolLocation: string;
  schoolPhone: string;
  theme: 'light' | 'dark' | 'system';
  sidebarVisible: boolean;
}

const defaultSettings: SchoolSettings = {
  schoolName: 'École Sans Base',
  schoolLocation: '',
  schoolPhone: '',
  theme: 'system',
  sidebarVisible: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));

    // Apply theme changes
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  // Apply theme on mount
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  return {
    settings,
    updateSettings,
  };
};
