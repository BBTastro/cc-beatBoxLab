"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { trackPageVisit, trackUserAction, getCurrentSession, setCurrentSession, clearCurrentSession } from "@/lib/user-tracking";
import { usePathname } from "next/navigation";

export function useUserTracking() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);
  const sessionId = useRef<string | null>(null);

  // Track page visits
  useEffect(() => {
    if (!session?.user?.id || !session?.user?.email) {
      console.log('User tracking skipped - no session data:', { 
        hasUserId: !!session?.user?.id, 
        hasEmail: !!session?.user?.email 
      });
      return;
    }

    const currentPath = pathname;
    
    // Skip if it's the same page (avoid duplicate tracking)
    if (lastPathname.current === currentPath) return;
    
    lastPathname.current = currentPath;

    // Get or create session ID
    let currentSessionId = getCurrentSession();
    if (!currentSessionId) {
      // Generate a new session ID for this visit
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSession(currentSessionId);
    }
    sessionId.current = currentSessionId;

    // Validate data before tracking
    if (!session.user.id || !session.user.email || !currentPath) {
      console.error('Invalid data for tracking:', {
        userId: session.user.id,
        email: session.user.email,
        path: currentPath
      });
      return;
    }

    // Track page visit
    trackPageVisit(
      session.user.id,
      session.user.email,
      currentPath,
      currentSessionId
    );
  }, [pathname, session?.user?.id, session?.user?.email]);

  // Track user actions
  const trackAction = (action: string, metadata?: Record<string, any>) => {
    if (!session?.user?.id || !session?.user?.email) return;

    trackUserAction(
      session.user.id,
      session.user.email,
      action,
      pathname,
      sessionId.current || undefined,
      metadata
    );
  };

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      // Clear session when component unmounts (user leaves the app)
      if (sessionId.current) {
        clearCurrentSession();
      }
    };
  }, []);

  return {
    trackAction,
    sessionId: sessionId.current,
  };
}
