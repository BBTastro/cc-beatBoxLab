"use client";

import { useState, useEffect } from 'react';

const DIETER_HERMAN_KEY = 'dieter-herman-theme';

export function useDieterHermanTheme() {
  const [isDieterHerman, setIsDieterHerman] = useState(false);

  useEffect(() => {
    // Load initial state from localStorage
    const stored = localStorage.getItem(DIETER_HERMAN_KEY);
    const initialState = stored ? JSON.parse(stored) : false;
    setIsDieterHerman(initialState);
    
    // Apply theme class to document
    if (initialState) {
      document.documentElement.classList.add('dieter-herman');
    }
  }, []);

  const toggleDieterHerman = () => {
    const newValue = !isDieterHerman;
    setIsDieterHerman(newValue);
    
    // Persist to localStorage
    localStorage.setItem(DIETER_HERMAN_KEY, JSON.stringify(newValue));
    
    // Apply/remove theme class
    if (newValue) {
      document.documentElement.classList.add('dieter-herman');
    } else {
      document.documentElement.classList.remove('dieter-herman');
    }
  };

  return {
    isDieterHerman,
    toggleDieterHerman,
  };
}
