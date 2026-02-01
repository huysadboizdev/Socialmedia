import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('dark'); // Default to dark for consistency with current design
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.log('Failed to load theme', e);
    } finally {
        setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await SecureStore.setItemAsync('theme', newTheme);
    } catch (e) {
      console.log('Failed to save theme', e);
    }
  };

  // Define colors for themes
  const colors = {
    dark: {
      background: '#09090b', // zinc-950
      card: '#18181b', // zinc-900
      text: '#ffffff',
      subtext: '#a1a1aa', // zinc-400
      border: '#27272a', // zinc-800
      primary: '#8b5cf6', // violet-500
      secondary: '#3f3f46', // zinc-700
      input: '#09090b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    },
    light: {
      background: '#f8fafc', // slate-50
      card: '#ffffff',
      text: '#0f172a', // slate-900
      subtext: '#64748b', // slate-500
      border: '#e2e8f0', // slate-200
      primary: '#8b5cf6', // violet-500
      secondary: '#f1f5f9', // slate-100
      input: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    }
  };

  const currentColors = colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: currentColors, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
