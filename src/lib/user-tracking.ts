// User tracking utilities for admin analytics

import { nanoid } from "nanoid";

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  signInAt: Date;
  signOutAt?: Date;
  sessionDuration?: number;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  email: string;
  activityType: 'sign_in' | 'page_visit' | 'return_visit' | 'action';
  pageUrl?: string;
  action?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Track user sign-in
 */
export async function trackUserSignIn(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  try {
    // Create session first
    const sessionResponse = await fetch('/api/user-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        ipAddress,
        userAgent,
      }),
    });

    let sessionId = nanoid(); // fallback session ID
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      sessionId = sessionData.session.id;
    }

    // Track sign-in activity
    const activityResponse = await fetch('/api/track-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        activityType: 'sign_in',
        sessionId,
        metadata: {
          ipAddress,
          userAgent,
          signInTime: new Date().toISOString(),
        },
      }),
    });

    if (!activityResponse.ok) {
      console.error('Failed to track user sign-in activity:', await activityResponse.text());
    }

    return sessionId;
  } catch (error) {
    console.error('Error tracking user sign-in:', error);
    return nanoid(); // Return fallback sessionId even if tracking fails
  }
}

/**
 * Track user sign-out
 */
export async function trackUserSignOut(
  userId: string,
  email: string,
  sessionId: string
): Promise<void> {
  try {
    const response = await fetch('/api/track-activity', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        sessionId,
        signOutAt: new Date(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to track user sign-out:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking user sign-out:', error);
  }
}

/**
 * Track page visit
 */
export async function trackPageVisit(
  userId: string,
  email: string,
  pageUrl: string,
  sessionId?: string
): Promise<void> {
  try {
    console.log('Tracking page visit:', { userId, email, pageUrl, sessionId });
    
    const response = await fetch('/api/track-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        activityType: 'page_visit',
        pageUrl,
        sessionId,
        metadata: {
          visitTime: new Date().toISOString(),
          referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to track page visit:', errorText);
      console.error('Response status:', response.status);
    } else {
      console.log('Page visit tracked successfully');
    }
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
}

/**
 * Track user action
 */
export async function trackUserAction(
  userId: string,
  email: string,
  action: string,
  pageUrl?: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const response = await fetch('/api/track-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        activityType: 'action',
        action,
        pageUrl,
        sessionId,
        metadata: {
          ...metadata,
          actionTime: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to track user action:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking user action:', error);
  }
}

/**
 * Check if user is returning (has previous sessions)
 * Note: This function is not currently used but could be implemented
 * with a separate endpoint if needed for non-admin users
 */
export async function isReturningUser(userId: string): Promise<boolean> {
  // For now, we'll assume all users are returning users
  // This could be implemented with a separate endpoint if needed
  return true;
}

/**
 * Get user session from localStorage
 */
export function getCurrentSession(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('stepbox-current-session');
}

/**
 * Set user session in localStorage
 */
export function setCurrentSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('stepbox-current-session', sessionId);
}

/**
 * Clear user session from localStorage
 */
export function clearCurrentSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('stepbox-current-session');
}
