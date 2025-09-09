"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  MotivationalStatement, 
  StoredMotivationalStatement,
  STORAGE_KEYS,
  StepBoxEvent
} from '@/lib/types';

interface MotivationContextType {
  statements: MotivationalStatement[];
  isLoading: boolean;
  
  // Statement management
  addStatement: (statement: Omit<MotivationalStatement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<MotivationalStatement>;
  updateStatement: (statementId: string, updates: Partial<MotivationalStatement>) => Promise<void>;
  deleteStatement: (statementId: string) => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
  
  // Event system
  emitEvent: (event: StepBoxEvent) => void;
}

const MotivationContext = createContext<MotivationContextType | null>(null);

export function useMotivationContext(): MotivationContextType {
  const context = useContext(MotivationContext);
  if (!context) {
    throw new Error('useMotivationContext must be used within a MotivationProvider');
  }
  return context;
}

interface MotivationProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function MotivationProvider({ children, userId }: MotivationProviderProps) {
  const [statements, setStatements] = useState<MotivationalStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Event emitter for cross-component communication
  const emitEvent = useCallback((event: StepBoxEvent) => {
    window.dispatchEvent(new CustomEvent(`stepbox-${event}`, { detail: { userId } }));
  }, [userId]);

  // Load data from localStorage
  const loadStatements = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STATEMENTS(userId));
      if (stored) {
        const parsedStatements = JSON.parse(stored) as StoredMotivationalStatement[];
        const statements = parsedStatements.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        setStatements(statements);
      }
    } catch (error) {
      console.error('Error loading statements:', error);
    }
  }, [userId]);

  // Save statements to localStorage
  const saveStatements = async (updatedStatements: MotivationalStatement[]) => {
    const stored = updatedStatements.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.STATEMENTS(userId), JSON.stringify(stored));
    setStatements(updatedStatements);
  };

  // Statement management functions
  const addStatement = async (statementData: Omit<MotivationalStatement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MotivationalStatement> => {
    const now = new Date();
    const statement: MotivationalStatement = {
      id: `statement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...statementData,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedStatements = [...statements, statement];
    await saveStatements(updatedStatements);
    
    emitEvent('statement-updated');
    return statement;
  };

  const updateStatement = async (statementId: string, updates: Partial<MotivationalStatement>): Promise<void> => {
    const updatedStatements = statements.map(s => 
      s.id === statementId 
        ? { ...s, ...updates, updatedAt: new Date() }
        : s
    );
    await saveStatements(updatedStatements);
    emitEvent('statement-updated');
  };

  const deleteStatement = async (statementId: string): Promise<void> => {
    const updatedStatements = statements.filter(s => s.id !== statementId);
    await saveStatements(updatedStatements);
    emitEvent('statement-updated');
  };

  // Data refresh
  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    await loadStatements();
    setIsLoading(false);
    emitEvent('data-refresh');
  };

  // Initialize data on mount
  useEffect(() => {
    loadStatements().then(() => setIsLoading(false));
  }, [loadStatements]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.STATEMENTS(userId)) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId, refreshData]);

  const value: MotivationContextType = {
    statements,
    isLoading,
    addStatement,
    updateStatement,
    deleteStatement,
    refreshData,
    emitEvent,
  };

  return (
    <MotivationContext.Provider value={value}>
      {children}
    </MotivationContext.Provider>
  );
}
