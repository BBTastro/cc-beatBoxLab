"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Challenge, 
  Beat, 
  BeatDetail, 
  Reward, 
  ChallengeWithStats,
  BeatWithDetails,
  MotivationalStatement,
  StoredChallenge,
  StoredBeat,
  StoredBeatDetail,
  StoredReward,
  StoredMotivationalStatement,
  STORAGE_KEYS,
  StepBoxEvent
} from '@/lib/types';

interface ChallengeContextType {
  // Current challenge state
  currentChallenge: ChallengeWithStats | null;
  challenges: Challenge[];
  beats: Beat[];
  beatDetails: BeatDetail[];
  rewards: Reward[];
  
  // Loading states
  isLoading: boolean;
  
  // Challenge management
  createChallenge: (challenge: Omit<Challenge, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Challenge>;
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  setDefaultChallenge: (challengeId: string) => Promise<void>;
  ensureOnlyOneActive: () => Promise<void>;
  setChallengeActive: (challengeId: string) => Promise<void>;
  syncToDatabase: () => Promise<void>;
  
  // Beat management
  completeBeat: (beatId: string) => Promise<void>;
  uncompleteBeat: (beatId: string) => Promise<void>;
  getBeatByDate: (date: Date) => Beat | null;
  getBeatsWithDetails: () => BeatWithDetails[];
  
  // Beat details management
  addBeatDetail: (beatId: string, content: string, category?: string) => Promise<BeatDetail>;
  updateBeatDetail: (detailId: string, updates: Partial<BeatDetail>) => Promise<void>;
  deleteBeatDetail: (detailId: string) => Promise<void>;
  getBeatDetails: (beatId: string) => BeatDetail[];
  
  // Reward management
  addReward: (reward: Omit<Reward, 'id' | 'userId' | 'challengeId' | 'createdAt' | 'updatedAt'>, challengeId?: string) => Promise<Reward>;
  updateReward: (rewardId: string, updates: Partial<Reward>) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
  achieveReward: (rewardId: string, proofUrl?: string) => Promise<void>;
  
  // Motivational statement management
  motivationalStatements: MotivationalStatement[];
  addMotivationalStatement: (statement: Omit<MotivationalStatement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<MotivationalStatement>;
  updateMotivationalStatement: (statementId: string, updates: Partial<MotivationalStatement>) => Promise<void>;
  deleteMotivationalStatement: (statementId: string) => Promise<void>;
  
  // Statistics and calculations
  getCompletionRate: () => number;
  getChallengeCompletionStats: (challengeId: string) => Promise<{ completed: number; total: number; percentage: number }>;
  
  // Phase calculations for grid display
  getPhases: () => Array<{
    number: number;
    startDay: number;
    endDay: number;
    beats: Beat[];
    isActive: boolean;
    isFinal: boolean;
  }>;
  
  // Data refresh
  refreshData: () => Promise<void>;
  
  // Event system
  emitEvent: (event: StepBoxEvent) => void;
}

const ChallengeContext = createContext<ChallengeContextType | null>(null);

export function useChallengeContext(): ChallengeContextType {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallengeContext must be used within a ChallengeProvider');
  }
  return context;
}

interface ChallengeProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function ChallengeProvider({ children, userId }: ChallengeProviderProps) {
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeWithStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [beatDetails, setBeatDetails] = useState<BeatDetail[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [motivationalStatements, setMotivationalStatements] = useState<MotivationalStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Event emitter for cross-component communication
  const emitEvent = useCallback((event: StepBoxEvent) => {
    window.dispatchEvent(new CustomEvent(`stepbox-${event}`, { detail: { userId } }));
  }, [userId]);

  // Migration function to move beat details from global to per-challenge storage
  const migrateBeatDetails = useCallback(async () => {
    try {
      // Check if old global beat details exist
      const oldGlobalDetails = localStorage.getItem(`stepbox-beat-details-${userId}`);
      if (oldGlobalDetails) {
        console.log('Migrating beat details from global to per-challenge storage...');
        
        const globalDetails = JSON.parse(oldGlobalDetails) as StoredBeatDetail[];
        
        // Group details by challenge ID (extracted from beat ID)
        const detailsByChallenge: { [challengeId: string]: StoredBeatDetail[] } = {};
        
        for (const detail of globalDetails) {
          // Extract challenge ID from beat ID (format: beat-{challengeId}-{dayNumber})
          const beatIdParts = detail.beatId.split('-');
          if (beatIdParts.length >= 3) {
            const challengeId = beatIdParts.slice(1, -1).join('-'); // Handle challenge IDs with dashes
            if (!detailsByChallenge[challengeId]) {
              detailsByChallenge[challengeId] = [];
            }
            detailsByChallenge[challengeId].push(detail);
          }
        }
        
        // Save details for each challenge
        for (const [challengeId, details] of Object.entries(detailsByChallenge)) {
          localStorage.setItem(STORAGE_KEYS.BEAT_DETAILS(userId, challengeId), JSON.stringify(details));
        }
        
        // Remove old global storage
        localStorage.removeItem(`stepbox-beat-details-${userId}`);
        console.log('Beat details migration completed');
      }
    } catch (error) {
      console.error('Error migrating beat details:', error);
    }
  }, [userId]);

  // Load data from localStorage
  const loadChallenges = useCallback(async () => {
    try {
      // Run migration first
      await migrateBeatDetails();
      
      const stored = localStorage.getItem(STORAGE_KEYS.CHALLENGES(userId));
      if (stored) {
        const parsedChallenges = JSON.parse(stored) as StoredChallenge[];
        let challenges = parsedChallenges.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          startDate: new Date(c.startDate), // Parse the ISO string directly
          endDate: new Date(c.endDate), // Parse the ISO string directly
        }));
        
        // Ensure only one challenge is active and at least one is active if challenges exist
        const activeChallenges = challenges.filter(c => c.status === 'active');
        
        if (activeChallenges.length > 1) {
          // Keep only the first active challenge, set others to undefined
          challenges = challenges.map(c => ({
            ...c,
            status: c.status === 'active' && c.id !== activeChallenges[0].id ? undefined : c.status
          }));
        } else if (activeChallenges.length === 0 && challenges.length > 0) {
          // If no challenges are active but challenges exist, make the first one active
          challenges = challenges.map((c, index) => ({
            ...c,
            status: index === 0 ? 'active' as const : c.status
          }));
        }
        
        // Save the corrected challenges if any changes were made
        const hasMultipleActive = activeChallenges.length > 1;
        const hasNoActiveButHasChallenges = activeChallenges.length === 0 && challenges.length > 0;
        
        if (hasMultipleActive || hasNoActiveButHasChallenges) {
          await saveChallenges(challenges);
        }
        
        setChallenges(challenges);
        
        // Set current challenge - prioritize active status, then default, then first
        const defaultChallengeId = localStorage.getItem(STORAGE_KEYS.DEFAULT_CHALLENGE(userId));
        console.log('loadChallenges - defaultChallengeId from localStorage:', defaultChallengeId);
        console.log('loadChallenges - challenges statuses:', challenges.map(c => ({ id: c.id, title: c.title, status: c.status })));
        
        const activeChallenge = challenges.find(c => c.status === 'active');
        console.log('loadChallenges - found active challenge:', activeChallenge?.id, activeChallenge?.title);
        
        const defaultChallenge = activeChallenge
          || challenges.find(c => defaultChallengeId ? c.id === defaultChallengeId : c.isDefault)
          || challenges[0];
        
        console.log('loadChallenges - selected default challenge:', defaultChallenge?.id, defaultChallenge?.title);
        
        if (defaultChallenge) {
          await loadChallengeData(defaultChallenge.id);
        }
      }

      // Load motivational statements
      const statementsStored = localStorage.getItem(STORAGE_KEYS.STATEMENTS(userId));
      if (statementsStored) {
        const parsedStatements = JSON.parse(statementsStored) as StoredMotivationalStatement[];
        const statements = parsedStatements.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        setMotivationalStatements(statements);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  }, [userId]);

  const loadChallengeData = useCallback(async (challengeId: string) => {
    try {
      let challenge = challenges.find(c => c.id === challengeId);
      
      // If not found in state, try to load from storage (handles race condition)
      if (!challenge) {
        const storedChallenges = localStorage.getItem(STORAGE_KEYS.CHALLENGES(userId));
        if (storedChallenges) {
          const parsedChallenges = JSON.parse(storedChallenges) as StoredChallenge[];
          const storedChallenge = parsedChallenges.find(c => c.id === challengeId);
          if (storedChallenge) {
            challenge = {
              ...storedChallenge,
              startDate: new Date(storedChallenge.startDate), // Parse the ISO string directly
              endDate: new Date(storedChallenge.endDate), // Parse the ISO string directly
              createdAt: new Date(storedChallenge.createdAt),
              updatedAt: new Date(storedChallenge.updatedAt),
            };
          }
        }
      }
      
      if (!challenge) return;

      // Load beats
      const beatsStored = localStorage.getItem(STORAGE_KEYS.BEATS(userId, challengeId));
      let challengeBeats: Beat[] = [];
      if (beatsStored) {
        const parsedBeats = JSON.parse(beatsStored) as StoredBeat[];
        challengeBeats = parsedBeats.map(b => ({
          ...b,
          date: new Date(b.date), // Parse the ISO string directly
          completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }));
      } else {
        // Generate beats for the challenge if they don't exist
        challengeBeats = generateBeatsForChallenge(challenge);
        await saveBeats(challengeId, challengeBeats);
      }
      setBeats(challengeBeats);

      // Load beat details
      const detailsStored = localStorage.getItem(STORAGE_KEYS.BEAT_DETAILS(userId, challengeId));
      let challengeBeatDetails: BeatDetail[] = [];
      if (detailsStored) {
        const parsedDetails = JSON.parse(detailsStored) as StoredBeatDetail[];
        challengeBeatDetails = parsedDetails.map(d => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        }));
        setBeatDetails(challengeBeatDetails);
      } else {
        // Initialize empty beat details for this challenge
        setBeatDetails([]);
      }

      // Load rewards
      const rewardsStored = localStorage.getItem(STORAGE_KEYS.REWARDS(userId, challengeId));
      let challengeRewards: Reward[] = [];
      if (rewardsStored) {
        const parsedRewards = JSON.parse(rewardsStored) as StoredReward[];
        challengeRewards = parsedRewards.map(r => ({
          ...r,
          achievedAt: r.achievedAt ? new Date(r.achievedAt) : undefined,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
        setRewards(challengeRewards);
      }

      // Create challenge with stats  
      const stats = calculateChallengeStats(challenge, challengeBeats, challengeRewards, challengeBeatDetails);
      setCurrentChallenge(stats);
    } catch (error) {
      console.error('Error loading challenge data:', error);
    }
  }, [challenges, userId]);

  // Helper function that accepts challenges array as parameter to avoid race conditions
  const loadChallengeDataWithChallenges = useCallback(async (challengeId: string, challengesArray: Challenge[]) => {
    try {
      let challenge = challengesArray.find(c => c.id === challengeId);
      
      // If not found in provided array, try to load from storage
      if (!challenge) {
        const storedChallenges = localStorage.getItem(STORAGE_KEYS.CHALLENGES(userId));
        if (storedChallenges) {
          const parsedChallenges = JSON.parse(storedChallenges) as StoredChallenge[];
          const storedChallenge = parsedChallenges.find(c => c.id === challengeId);
          if (storedChallenge) {
            challenge = {
              ...storedChallenge,
              startDate: new Date(storedChallenge.startDate), // Parse the ISO string directly
              endDate: new Date(storedChallenge.endDate), // Parse the ISO string directly
              createdAt: new Date(storedChallenge.createdAt),
              updatedAt: new Date(storedChallenge.updatedAt),
            };
          }
        }
      }
      
      if (!challenge) return;

      // Load beats
      const beatsStored = localStorage.getItem(STORAGE_KEYS.BEATS(userId, challengeId));
      let challengeBeats: Beat[] = [];
      if (beatsStored) {
        const parsedBeats = JSON.parse(beatsStored) as StoredBeat[];
        challengeBeats = parsedBeats.map(b => ({
          ...b,
          date: new Date(b.date), // Parse the ISO string directly
          completedAt: b.completedAt ? new Date(b.completedAt) : undefined,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }));
      } else {
        // Generate beats for the challenge if they don't exist
        challengeBeats = generateBeatsForChallenge(challenge);
        await saveBeats(challengeId, challengeBeats);
      }
      setBeats(challengeBeats);

      // Load beat details
      const detailsStored = localStorage.getItem(STORAGE_KEYS.BEAT_DETAILS(userId, challengeId));
      let challengeBeatDetails: BeatDetail[] = [];
      if (detailsStored) {
        const parsedDetails = JSON.parse(detailsStored) as StoredBeatDetail[];
        challengeBeatDetails = parsedDetails.map(d => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        }));
        setBeatDetails(challengeBeatDetails);
      } else {
        // Initialize empty beat details for this challenge
        setBeatDetails([]);
      }

      // Load rewards
      const rewardsStored = localStorage.getItem(STORAGE_KEYS.REWARDS(userId, challengeId));
      let challengeRewards: Reward[] = [];
      if (rewardsStored) {
        const parsedRewards = JSON.parse(rewardsStored) as StoredReward[];
        challengeRewards = parsedRewards.map(r => ({
          ...r,
          achievedAt: r.achievedAt ? new Date(r.achievedAt) : undefined,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
        setRewards(challengeRewards);
      }

      // Create challenge with stats  
      const stats = calculateChallengeStats(challenge, challengeBeats, challengeRewards, challengeBeatDetails);
      setCurrentChallenge(stats);
    } catch (error) {
      console.error('Error loading challenge data with challenges array:', error);
    }
  }, [userId]);

  // Generate beats for a new challenge
  const generateBeatsForChallenge = (challenge: Challenge): Beat[] => {
    const beats: Beat[] = [];
    const startDate = new Date(challenge.startDate);
    
    for (let i = 0; i < challenge.duration; i++) {
      const beatDate = new Date(startDate);
      beatDate.setDate(startDate.getDate() + i);
      
      beats.push({
        id: `beat-${challenge.id}-${i + 1}`,
        challengeId: challenge.id,
        userId: challenge.userId,
        date: beatDate,
        dayNumber: i + 1,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return beats;
  };

  // Calculate challenge statistics
  const calculateChallengeStats = (
    challenge: Challenge, 
    challengeBeats: Beat[], 
    challengeRewards: Reward[],
    challengeBeatDetails: BeatDetail[] = beatDetails
  ): ChallengeWithStats => {
    // Use the same logic as the beats page: a beat is completed if it has details
    const completedBeats = challengeBeats.filter(beat => {
      const hasDetails = challengeBeatDetails.some(detail => detail.beatId === beat.id);
      return hasDetails;
    }).length;
    
    const totalBeats = challengeBeats.length;
    
    return {
      ...challenge,
      totalBeats,
      completedBeats,
      rewardsCount: challengeRewards.length,
    };
  };

  // Save functions
  const saveChallenges = async (updatedChallenges: Challenge[]) => {
    const stored = updatedChallenges.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.CHALLENGES(userId), JSON.stringify(stored));
    setChallenges(updatedChallenges);
  };

  const saveBeats = async (challengeId: string, updatedBeats: Beat[]) => {
    const stored = updatedBeats.map(b => ({
      ...b,
      date: b.date.toISOString(),
      completedAt: b.completedAt?.toISOString(),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.BEATS(userId, challengeId), JSON.stringify(stored));
    setBeats(updatedBeats);
  };

  const saveBeatDetails = async (updatedDetails: BeatDetail[], challengeId?: string) => {
    const targetChallengeId = challengeId || currentChallenge?.id;
    if (!targetChallengeId) {
      console.error('No challenge ID available for saving beat details');
      return;
    }
    
    const stored = updatedDetails.map(d => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.BEAT_DETAILS(userId, targetChallengeId), JSON.stringify(stored));
    setBeatDetails(updatedDetails);
  };

  const saveRewards = async (challengeId: string, updatedRewards: Reward[]) => {
    const stored = updatedRewards.map(r => ({
      ...r,
      achievedAt: r.achievedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.REWARDS(userId, challengeId), JSON.stringify(stored));
    setRewards(updatedRewards);
  };

  const saveMotivationalStatements = async (updatedStatements: MotivationalStatement[]) => {
    const stored = updatedStatements.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.STATEMENTS(userId), JSON.stringify(stored));
    setMotivationalStatements(updatedStatements);
  };

  // Challenge management functions
  const createChallenge = async (challengeData: Omit<Challenge, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Challenge> => {
    const now = new Date();
    const challenge: Challenge = {
      id: `challenge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId,
      ...challengeData,
      createdAt: now,
      updatedAt: now,
    };
    
    // Check if we need to make this challenge active
    const hasActiveChallenge = challenges.some(c => c.status === 'active');
    const isFirstChallenge = challenges.length === 0;
    
    // If this is the first challenge or no challenges are active, make this one active
    if (isFirstChallenge || !hasActiveChallenge) {
      challenge.status = 'active';
    }
    
    const updatedChallenges = [...challenges, challenge];
    await saveChallenges(updatedChallenges);
    
    // Generate beats for the new challenge
    const challengeBeats = generateBeatsForChallenge(challenge);
    await saveBeats(challenge.id, challengeBeats);
    
    emitEvent('challenge-updated');
    return challenge;
  };

  const updateChallenge = async (challengeId: string, updates: Partial<Challenge>): Promise<void> => {
    console.log('updateChallenge called:', { challengeId, updates });
    
    const updatedChallenges = challenges.map(c => 
      c.id === challengeId 
        ? { ...c, ...updates, updatedAt: new Date() }
        : c
    );
    
    console.log('Updated challenges:', updatedChallenges.map(c => ({ id: c.id, title: c.title, status: c.status })));
    
    await saveChallenges(updatedChallenges);
    
    // Update the local state immediately so subsequent calls use the updated data
    setChallenges(updatedChallenges);
    
    // If this challenge is being set as active, or if it's the current challenge, reload it
    if (updates.status === 'active' || currentChallenge?.id === challengeId) {
      console.log('Loading challenge data for:', challengeId);
      await loadChallengeData(challengeId);
    }
    
    // If a challenge is being set as active, we need to reload the current challenge
    // to ensure the UI reflects the new active challenge
    if (updates.status === 'active') {
      // Find the newly active challenge and set it as current
      const activeChallenge = updatedChallenges.find(c => c.status === 'active');
      console.log('Found active challenge:', activeChallenge?.id, activeChallenge?.title);
      if (activeChallenge) {
        console.log('Loading data for active challenge:', activeChallenge.id);
        // Use the updated challenges array directly to avoid race conditions
        await loadChallengeDataWithChallenges(activeChallenge.id, updatedChallenges);
      }
      
      // Automatically sync to database when challenge becomes active
      try {
        console.log('Auto-syncing to database after challenge status change to active...');
        await syncToDatabase();
      } catch (error) {
        console.error('Error auto-syncing to database:', error);
        // Don't throw - this is a background sync operation
      }
    }
    
    emitEvent('challenge-updated');
  };

  const deleteChallenge = async (challengeId: string): Promise<void> => {
    const challengeToDelete = challenges.find(c => c.id === challengeId);
    const updatedChallenges = challenges.filter(c => c.id !== challengeId);
    
    // If we're deleting the active challenge and there are other challenges, make another one active
    if (challengeToDelete?.status === 'active' && updatedChallenges.length > 0) {
      // Make the first remaining challenge active
      const challengesWithActive = updatedChallenges.map((c, index) => ({
        ...c,
        status: index === 0 ? 'active' as const : c.status
      }));
      await saveChallenges(challengesWithActive);
    } else {
      await saveChallenges(updatedChallenges);
    }
    
    // Clean up related data
    localStorage.removeItem(STORAGE_KEYS.BEATS(userId, challengeId));
    localStorage.removeItem(STORAGE_KEYS.REWARDS(userId, challengeId));
    
    // If this was the current challenge, switch to another
    if (currentChallenge?.id === challengeId) {
      const nextChallenge = updatedChallenges.find(c => c.status === 'active') || updatedChallenges[0];
      if (nextChallenge) {
        await setDefaultChallenge(nextChallenge.id);
      } else {
        setCurrentChallenge(null);
      }
    }
    
    emitEvent('challenge-updated');
  };

  const setDefaultChallenge = async (challengeId: string): Promise<void> => {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_CHALLENGE(userId), challengeId);
    await loadChallengeData(challengeId);
    emitEvent('challenge-updated');
  };

  const ensureOnlyOneActive = async (): Promise<void> => {
    const activeChallenges = challenges.filter(c => c.status === 'active');
    if (activeChallenges.length > 1) {
      // Keep only the first active challenge, set others to undefined
      const updatedChallenges = challenges.map(c => ({
        ...c,
        status: c.status === 'active' && c.id !== activeChallenges[0].id ? undefined : c.status
      }));
      await saveChallenges(updatedChallenges);
      emitEvent('challenge-updated');
    }
  };

  const setChallengeActive = async (challengeId: string): Promise<void> => {
    console.log('setChallengeActive called for:', challengeId);
    
    // Update all challenges in one atomic operation
    const updatedChallenges = challenges.map(c => ({
      ...c,
      status: c.id === challengeId ? 'active' as const : undefined,
      updatedAt: new Date()
    }));
    
    console.log('setChallengeActive - updated challenges:', updatedChallenges.map(c => ({ id: c.id, title: c.title, status: c.status })));
    
    // Save to localStorage
    await saveChallenges(updatedChallenges);
    
    // Set as default challenge
    localStorage.setItem(STORAGE_KEYS.DEFAULT_CHALLENGE(userId), challengeId);
    
    // Load the new active challenge data using the updated challenges array
    const activeChallenge = updatedChallenges.find(c => c.status === 'active');
    if (activeChallenge) {
      console.log('setChallengeActive - loading data for active challenge:', activeChallenge.id);
      // Use the updated challenges array directly instead of relying on state
      await loadChallengeDataWithChallenges(activeChallenge.id, updatedChallenges);
    }
    
    // Automatically sync to database when active challenge changes
    try {
      console.log('Auto-syncing to database after active challenge change...');
      await syncToDatabase();
    } catch (error) {
      console.error('Error auto-syncing to database:', error);
      // Don't throw - this is a background sync operation
    }
    
    emitEvent('challenge-updated');
  };

  const syncToDatabase = async (): Promise<void> => {
    try {
      console.log('Syncing challenge data to database...');
      
      // Get all data from localStorage - ensure we have the latest data
      const allChallenges = challenges;
      const allBeats = beats;
      const allBeatDetails = beatDetails;
      const allRewards = rewards;
      
      // Get motivational statements from localStorage
      const statementsStored = localStorage.getItem(STORAGE_KEYS.STATEMENTS(userId));
      const allMotivationalStatements = statementsStored ? JSON.parse(statementsStored) : [];

      console.log('Syncing challenges:', allChallenges.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        isDefault: c.isDefault
      })));

      // Send to sync API
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenges: allChallenges,
          beats: allBeats,
          beatDetails: allBeatDetails,
          rewards: allRewards,
          motivationalStatements: allMotivationalStatements,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Sync result:', result);
      
      if (result.success) {
        console.log(`Successfully synced ${result.summary.totalSynced} items to database`);
      } else {
        console.error('Sync failed:', result.error);
      }
    } catch (error) {
      console.error('Error syncing to database:', error);
    }
  };

  // Beat management functions
  const completeBeat = async (beatId: string): Promise<void> => {
    const updatedBeats = beats.map(b => 
      b.id === beatId 
        ? { ...b, isCompleted: true, completedAt: new Date(), updatedAt: new Date() }
        : b
    );
    
    if (currentChallenge) {
      await saveBeats(currentChallenge.id, updatedBeats);
      const stats = calculateChallengeStats(currentChallenge, updatedBeats, rewards, beatDetails);
      setCurrentChallenge(stats);
    }
    
    emitEvent('beat-completed');
  };

  const uncompleteBeat = async (beatId: string): Promise<void> => {
    const updatedBeats = beats.map(b => 
      b.id === beatId 
        ? { ...b, isCompleted: false, completedAt: undefined, updatedAt: new Date() }
        : b
    );
    
    if (currentChallenge) {
      await saveBeats(currentChallenge.id, updatedBeats);
      const stats = calculateChallengeStats(currentChallenge, updatedBeats, rewards, beatDetails);
      setCurrentChallenge(stats);
    }
    
    emitEvent('beat-uncompleted');
  };

  const getBeatByDate = (date: Date): Beat | null => {
    return beats.find(b => 
      b.date.getFullYear() === date.getFullYear() &&
      b.date.getMonth() === date.getMonth() &&
      b.date.getDate() === date.getDate()
    ) || null;
  };

  const getBeatsWithDetails = (): BeatWithDetails[] => {
    return beats.map(beat => ({
      ...beat,
      details: beatDetails.filter(d => d.beatId === beat.id),
    }));
  };

  // Beat details management
  const addBeatDetail = async (beatId: string, content: string, category?: string): Promise<BeatDetail> => {
    const now = new Date();
    const detail: BeatDetail = {
      id: `detail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      beatId,
      userId,
      content,
      category,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedDetails = [...beatDetails, detail];
    await saveBeatDetails(updatedDetails, currentChallenge?.id);
    
    // Recalculate challenge stats after adding beat detail
    if (currentChallenge) {
      const stats = calculateChallengeStats(currentChallenge, beats, rewards, updatedDetails);
      setCurrentChallenge(stats);
    }
    
    emitEvent('detail-added');
    return detail;
  };

  const updateBeatDetail = async (detailId: string, updates: Partial<BeatDetail>): Promise<void> => {
    const updatedDetails = beatDetails.map(d => 
      d.id === detailId 
        ? { ...d, ...updates, updatedAt: new Date() }
        : d
    );
    await saveBeatDetails(updatedDetails, currentChallenge?.id);
    
    // Recalculate challenge stats after updating beat detail
    if (currentChallenge) {
      const stats = calculateChallengeStats(currentChallenge, beats, rewards, updatedDetails);
      setCurrentChallenge(stats);
    }
    
    emitEvent('detail-updated');
  };

  const deleteBeatDetail = async (detailId: string): Promise<void> => {
    const updatedDetails = beatDetails.filter(d => d.id !== detailId);
    await saveBeatDetails(updatedDetails, currentChallenge?.id);
    
    // Recalculate challenge stats after deleting beat detail
    if (currentChallenge) {
      const stats = calculateChallengeStats(currentChallenge, beats, rewards, updatedDetails);
      setCurrentChallenge(stats);
    }
    
    emitEvent('detail-deleted');
  };

  const getBeatDetails = (beatId: string): BeatDetail[] => {
    return beatDetails.filter(d => d.beatId === beatId);
  };

  // Reward management
  const addReward = async (rewardData: Omit<Reward, 'id' | 'userId' | 'challengeId' | 'createdAt' | 'updatedAt'>, challengeId?: string): Promise<Reward> => {
    const targetChallengeId = challengeId || currentChallenge?.id;
    if (!targetChallengeId) throw new Error('No challenge ID provided and no current challenge');
    
    // Load existing rewards for this challenge from localStorage
    let existingRewards: Reward[] = [];
    if (targetChallengeId === currentChallenge?.id) {
      // Use current state if it's the active challenge
      existingRewards = rewards;
    } else {
      // Load from storage for other challenges
      const rewardsStored = localStorage.getItem(STORAGE_KEYS.REWARDS(userId, targetChallengeId));
      if (rewardsStored) {
        const parsedRewards = JSON.parse(rewardsStored) as StoredReward[];
        existingRewards = parsedRewards.map(r => ({
          ...r,
          achievedAt: r.achievedAt ? new Date(r.achievedAt) : undefined,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
      }
    }
    
    const now = new Date();
    const reward: Reward = {
      id: `reward-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId,
      challengeId: targetChallengeId,
      ...rewardData,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedRewards = [...existingRewards, reward];
    await saveRewards(targetChallengeId, updatedRewards);
    
    emitEvent('reward-added');
    return reward;
  };

  const updateReward = async (rewardId: string, updates: Partial<Reward>): Promise<void> => {
    const updatedRewards = rewards.map(r => 
      r.id === rewardId 
        ? { ...r, ...updates, updatedAt: new Date() }
        : r
    );
    
    if (currentChallenge) {
      await saveRewards(currentChallenge.id, updatedRewards);
    }
    
    emitEvent('reward-updated');
  };

  const deleteReward = async (rewardId: string): Promise<void> => {
    const updatedRewards = rewards.filter(r => r.id !== rewardId);
    
    if (currentChallenge) {
      await saveRewards(currentChallenge.id, updatedRewards);
    }
    
    emitEvent('reward-updated');
  };

  const achieveReward = async (rewardId: string, proofUrl?: string): Promise<void> => {
    await updateReward(rewardId, {
      status: 'achieved',
      achievedAt: new Date(),
      proofUrl,
    });
    
    emitEvent('reward-achieved');
  };

  // Motivational statement management
  const addMotivationalStatement = async (statementData: Omit<MotivationalStatement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<MotivationalStatement> => {
    const now = new Date();
    const statement: MotivationalStatement = {
      id: `statement-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId,
      ...statementData,
      createdAt: now,
      updatedAt: now,
    };
    
    const updatedStatements = [...motivationalStatements, statement];
    await saveMotivationalStatements(updatedStatements);
    
    emitEvent('statement-updated');
    return statement;
  };

  const updateMotivationalStatement = async (statementId: string, updates: Partial<MotivationalStatement>): Promise<void> => {
    const updatedStatements = motivationalStatements.map(s => 
      s.id === statementId 
        ? { ...s, ...updates, updatedAt: new Date() }
        : s
    );
    
    await saveMotivationalStatements(updatedStatements);
    emitEvent('statement-updated');
  };

  const deleteMotivationalStatement = async (statementId: string): Promise<void> => {
    const updatedStatements = motivationalStatements.filter(s => s.id !== statementId);
    await saveMotivationalStatements(updatedStatements);
    emitEvent('statement-updated');
  };

  // Statistics

  const getCompletionRate = (): number => {
    if (!currentChallenge || currentChallenge.totalBeats === 0) return 0;
    return (currentChallenge.completedBeats / currentChallenge.totalBeats) * 100;
  };

  const getChallengeCompletionStats = async (challengeId: string): Promise<{ completed: number; total: number; percentage: number }> => {
    try {
      const beatsStored = localStorage.getItem(STORAGE_KEYS.BEATS(userId, challengeId));
      const detailsStored = localStorage.getItem(STORAGE_KEYS.BEAT_DETAILS(userId, challengeId));
      
      if (beatsStored) {
        const beats = JSON.parse(beatsStored) as StoredBeat[];
        const beatDetails = detailsStored ? JSON.parse(detailsStored) as StoredBeatDetail[] : [];
        
        // Use the same logic as the beats page: a beat is completed if it has details
        const completedBeats = beats.filter(beat => {
          const hasDetails = beatDetails.some(detail => detail.beatId === beat.id);
          return hasDetails;
        }).length;
        
        const totalBeats = beats.length;
        const percentage = totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0;
        return { completed: completedBeats, total: totalBeats, percentage };
      } else {
        // If no beats exist yet, return 0%
        return { completed: 0, total: 0, percentage: 0 };
      }
    } catch (error) {
      console.error('Error getting challenge completion stats:', error);
      return { completed: 0, total: 0, percentage: 0 };
    }
  };

  // Phase calculations
  const getPhases = () => {
    if (!currentChallenge) return [];
    
    const phases = [];
    const maxPhaseSize = 91;
    const totalDays = currentChallenge.duration;
    
    // Handle single day challenge
    if (totalDays <= 1) {
      phases.push({
        number: 1,
        startDay: 1,
        endDay: 1,
        beats: beats.filter(b => b.dayNumber === 1),
        isActive: true,
        isFinal: true,
      });
      return phases;
    }
    
    // For 365-day challenges: 4 phases of 91 days + 1 final phase of 1 day
    if (totalDays === 365) {
      // Phase 1: Days 1-91
      phases.push({
        number: 1,
        startDay: 1,
        endDay: 91,
        beats: beats.filter(b => b.dayNumber >= 1 && b.dayNumber <= 91),
        isActive: beats.filter(b => b.dayNumber >= 1 && b.dayNumber <= 91).some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
        isFinal: false,
      });
      
      // Phase 2: Days 92-182
      phases.push({
        number: 2,
        startDay: 92,
        endDay: 182,
        beats: beats.filter(b => b.dayNumber >= 92 && b.dayNumber <= 182),
        isActive: beats.filter(b => b.dayNumber >= 92 && b.dayNumber <= 182).some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
        isFinal: false,
      });
      
      // Phase 3: Days 183-273
      phases.push({
        number: 3,
        startDay: 183,
        endDay: 273,
        beats: beats.filter(b => b.dayNumber >= 183 && b.dayNumber <= 273),
        isActive: beats.filter(b => b.dayNumber >= 183 && b.dayNumber <= 273).some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
        isFinal: false,
      });
      
      // Phase 4: Days 274-364
      phases.push({
        number: 4,
        startDay: 274,
        endDay: 364,
        beats: beats.filter(b => b.dayNumber >= 274 && b.dayNumber <= 364),
        isActive: beats.filter(b => b.dayNumber >= 274 && b.dayNumber <= 364).some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
        isFinal: false,
      });
      
      // Phase 5: Final day (365)
      phases.push({
        number: 5,
        startDay: 365,
        endDay: 365,
        beats: beats.filter(b => b.dayNumber === 365),
        isActive: beats.filter(b => b.dayNumber === 365).some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
        isFinal: true,
      });
      
      return phases;
    }
    
    // For other challenge durations: use the original 2-phase system
    // Phase 1: All days except the final day
    const phase1EndDay = totalDays - 1;
    const phase1Beats = beats.filter(b => b.dayNumber >= 1 && b.dayNumber <= phase1EndDay);
    
    phases.push({
      number: 1,
      startDay: 1,
      endDay: phase1EndDay,
      beats: phase1Beats,
      isActive: phase1Beats.some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
      isFinal: false,
    });
    
    // Phase 2: Final day only
    const phase2Beats = beats.filter(b => b.dayNumber === totalDays);
    
    phases.push({
      number: 2,
      startDay: totalDays,
      endDay: totalDays,
      beats: phase2Beats,
      isActive: phase2Beats.some(b => !b.isCompleted && b.dayNumber <= Math.floor((Date.now() - currentChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
      isFinal: true,
    });
    
    return phases;
  };

  // Data refresh
  const refreshData = async (): Promise<void> => {
    console.log('refreshData called');
    setIsLoading(true);
    await loadChallenges();
    setIsLoading(false);
    emitEvent('data-refresh');
    console.log('refreshData completed');
  };

  // Initialize data on mount
  useEffect(() => {
    loadChallenges().then(() => setIsLoading(false));
  }, [loadChallenges]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(`stepbox-`) && e.key.includes(userId)) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId, refreshData]);

  const value: ChallengeContextType = {
    currentChallenge,
    challenges,
    beats,
    beatDetails,
    rewards,
    motivationalStatements,
    isLoading,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    setDefaultChallenge,
    ensureOnlyOneActive,
    setChallengeActive,
    syncToDatabase,
    completeBeat,
    uncompleteBeat,
    getBeatByDate,
    getBeatsWithDetails,
    addBeatDetail,
    updateBeatDetail,
    deleteBeatDetail,
    getBeatDetails,
    addReward,
    updateReward,
    deleteReward,
    achieveReward,
    addMotivationalStatement,
    updateMotivationalStatement,
    deleteMotivationalStatement,
    getCompletionRate,
    getChallengeCompletionStats,
    getPhases,
    refreshData,
    emitEvent,
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
}
