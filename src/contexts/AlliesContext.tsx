"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Ally, 
  StoredAlly,
  STORAGE_KEYS,
  BeatBoxEvent,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '@/lib/types';

interface AlliesContextType {
  allies: Ally[];
  isLoading: boolean;
  
  // Ally management
  addAlly: (ally: Omit<Ally, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Ally>;
  updateAlly: (allyId: string, updates: Partial<Ally>) => Promise<void>;
  deleteAlly: (allyId: string) => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
  
  // Event system
  emitEvent: (event: BeatBoxEvent) => void;
}

const AlliesContext = createContext<AlliesContextType | null>(null);

export function useAlliesContext(): AlliesContextType {
  const context = useContext(AlliesContext);
  if (!context) {
    throw new Error('useAlliesContext must be used within an AlliesProvider');
  }
  return context;
}

interface AlliesProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function AlliesProvider({ children, userId }: AlliesProviderProps) {
  const [allies, setAllies] = useState<Ally[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Event emitter for cross-component communication
  const emitEvent = useCallback((event: BeatBoxEvent) => {
    window.dispatchEvent(new CustomEvent(`beatbox-${event}`, { detail: { userId } }));
  }, [userId]);

  // Load data from localStorage
  const loadAllies = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALLIES(userId));
      if (stored) {
        const parsedAllies = JSON.parse(stored) as StoredAlly[];
        const allies = parsedAllies.map(a => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }));
        setAllies(allies);
      }
    } catch (error) {
      console.error('Error loading allies:', error);
    }
  }, [userId]);

  // Save allies to localStorage
  const saveAllies = async (updatedAllies: Ally[]) => {
    const stored = updatedAllies.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.ALLIES(userId), JSON.stringify(stored));
    setAllies(updatedAllies);
  };

  // Ally management functions
  const addAlly = async (allyData: Omit<Ally, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Ally> => {
    const now = new Date();
    const ally: Ally = {
      id: `ally-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...allyData,
      notificationPreferences: allyData.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedAllies = [...allies, ally];
    await saveAllies(updatedAllies);
    
    emitEvent('ally-added');
    return ally;
  };

  const updateAlly = async (allyId: string, updates: Partial<Ally>): Promise<void> => {
    const updatedAllies = allies.map(a => 
      a.id === allyId 
        ? { ...a, ...updates, updatedAt: new Date() }
        : a
    );
    await saveAllies(updatedAllies);
    emitEvent('ally-updated');
  };

  const deleteAlly = async (allyId: string): Promise<void> => {
    const updatedAllies = allies.filter(a => a.id !== allyId);
    await saveAllies(updatedAllies);
    emitEvent('ally-updated');
  };

  // Data refresh
  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    await loadAllies();
    setIsLoading(false);
    emitEvent('data-refresh');
  };

  // Initialize data on mount
  useEffect(() => {
    loadAllies().then(() => setIsLoading(false));
  }, [loadAllies]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ALLIES(userId)) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId, refreshData]);

  const value: AlliesContextType = {
    allies,
    isLoading,
    addAlly,
    updateAlly,
    deleteAlly,
    refreshData,
    emitEvent,
  };

  return (
    <AlliesContext.Provider value={value}>
      {children}
    </AlliesContext.Provider>
  );
}
