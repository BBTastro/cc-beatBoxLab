// Core StepBox Types and Interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  userId: string;
  title: string;
  description?: string;
  duration: number; // days
  status?: 'active' | 'completed' | 'paused' | 'archived';
  isDefault: boolean;
  startDate: Date;
  endDate: Date;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Beat {
  id: string;
  challengeId: string;
  userId: string;
  date: Date;
  dayNumber: number; // 1-based day number in challenge
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BeatDetail {
  id: string;
  beatId: string;
  userId: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  id: string;
  challengeId: string;
  userId: string;
  title: string;
  description?: string;
  status: 'planned' | 'active' | 'achieved';
  proofUrl?: string;
  achievedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MotivationalStatement {
  id: string;
  userId: string;
  challengeId?: string;
  title: string;
  statement: string;
  why?: string;
  collaboration?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ally {
  id: string;
  userId: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  telegramHandle?: string;
  slackHandle?: string;
  discordUsername?: string;
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  phone: boolean;
  telegram: boolean;
  slack: boolean;
  discord: boolean;
  push: boolean;
}

export interface MoveConcept {
  id: string;
  userId: string;
  type: 'strategy' | 'flow' | 'create' | 'build' | 'strength' | 'restore';
  title: string;
  description: string;
  content: string;
  aiBoostContent?: string;
  tags: string[];
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  dayCount: number;
  suggestedCategories: string[];
  defaultTitle: string;
  defaultDescription: string;
  defaultStartDate: string;
  motivationalStatement: {
    title: string;
    statement: string;
    why: string;
    collaboration: string;
  };
  rewards: {
    title: string;
    value: string;
    description: string;
    status: string;
  }[];
  isDefault?: boolean;
}

// Extended types for UI components
export interface BeatWithDetails extends Beat {
  details: BeatDetail[];
}

export interface ChallengeWithStats extends Challenge {
  totalBeats: number;
  completedBeats: number;
  rewardsCount: number;
}

// Phase system for grid display
export interface Phase {
  number: number;
  startDay: number;
  endDay: number;
  beats: Beat[];
  isActive: boolean;
  isFinal: boolean;
}

// Filter types for Details page
export interface DetailFilters {
  startDate?: Date;
  endDate?: Date;
  categories: string[];
  showCount: boolean;
  showDate: boolean;
  sortOrder: 'asc' | 'desc' | 'first-last' | 'last-first';
}

// Grid display configuration
export interface GridConfig {
  itemsPerRow: number;
  maxPhaseSize: number;
  finalDayThreshold: number;
}

// Theme configuration
export interface ThemeConfig {
  isDieterHerman: boolean;
  systemTheme: 'light' | 'dark' | 'system';
}

// Local storage data structures (for client-side storage)
export interface StoredChallenge extends Omit<Challenge, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface StoredBeat extends Omit<Beat, 'date' | 'completedAt' | 'createdAt' | 'updatedAt'> {
  date: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredBeatDetail extends Omit<BeatDetail, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface StoredReward extends Omit<Reward, 'achievedAt' | 'createdAt' | 'updatedAt'> {
  achievedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredMotivationalStatement extends Omit<MotivationalStatement, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface StoredAlly extends Omit<Ally, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface StoredMoveConcept extends Omit<MoveConcept, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

// Event types for cross-component communication
export type StepBoxEvent = 
  | 'challenge-updated'
  | 'beat-completed'
  | 'beat-uncompleted'
  | 'detail-added'
  | 'detail-updated'
  | 'detail-deleted'
  | 'reward-added'
  | 'reward-updated'
  | 'reward-achieved'
  | 'statement-updated'
  | 'ally-added'
  | 'ally-updated'
  | 'move-updated'
  | 'data-refresh';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface ChallengeForm {
  title: string;
  description: string;
  duration: number;
  startDate: Date;
  templateId?: string;
  motivationalStatement?: {
    title: string;
    statement: string;
    why: string;
    collaboration: string;
  };
  rewards?: {
    title: string;
    value: string;
    description: string;
    status: string;
  }[];
}

export interface BeatDetailForm {
  content: string;
  category?: string;
}

export interface RewardForm {
  title: string;
  description?: string;
  status: 'planned' | 'active' | 'achieved';
  proofUrl?: string;
}

export interface MotivationalStatementForm {
  title: string;
  statement: string;
  why?: string;
  collaboration?: string;
}

export interface AllyForm {
  name: string;
  email: string;
  role?: string;
  phone?: string;
  telegramHandle?: string;
  slackHandle?: string;
  discordUsername?: string;
  notificationPreferences: NotificationPreferences;
}

// Constants
export const BEAT_STATUSES = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FUTURE: 'future',
} as const;

export const CHALLENGE_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
} as const;

export const REWARD_STATUSES = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  ACHIEVED: 'achieved',
} as const;

export const MOVE_TYPES = {
  STRATEGY: 'strategy',
  FLOW: 'flow',
  CREATE: 'create',
  BUILD: 'build',
  STRENGTH: 'strength',
  RESTORE: 'restore',
} as const;

export const GRID_CONFIG: GridConfig = {
  itemsPerRow: 7,
  maxPhaseSize: 91,
  finalDayThreshold: 1,
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  sms: false,
  phone: false,
  telegram: false,
  slack: false,
  discord: false,
  push: true,
};

// Storage keys pattern: stepbox-{datatype}-{userId}[-{challengeId}]
export const STORAGE_KEYS = {
  CHALLENGES: (userId: string) => `stepbox-challenges-${userId}`,
  BEATS: (userId: string, challengeId: string) => `stepbox-beats-${userId}-${challengeId}`,
  BEAT_DETAILS: (userId: string, challengeId: string) => `stepbox-beat-details-${userId}-${challengeId}`,
  REWARDS: (userId: string, challengeId: string) => `stepbox-rewards-${userId}-${challengeId}`,
  STATEMENTS: (userId: string) => `stepbox-statements-${userId}`,
  ALLIES: (userId: string) => `stepbox-allies-${userId}`,
  MOVES: (userId: string) => `stepbox-moves-${userId}`,
  THEME: 'stepbox-theme',
  DIETER_HERMAN: 'dieter-herman-theme',
  DEFAULT_CHALLENGE: (userId: string) => `stepbox-default-challenge-${userId}`,
} as const;
