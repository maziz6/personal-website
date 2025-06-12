import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // On mount: check localStorage for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    const prefersDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark-mode', prefersDark);
  }, []);

  // Toggle theme between dark and light
  const toggleTheme = () => {
    setDarkMode(prevMode => {
      const nextMode = !prevMode;
      document.documentElement.classList.toggle('dark-mode', nextMode);
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
      return nextMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
