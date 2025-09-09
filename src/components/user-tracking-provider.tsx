"use client";

import { useUserTracking } from "@/hooks/use-user-tracking";

export function UserTrackingProvider({ children }: { children: React.ReactNode }) {
  // Initialize user tracking
  useUserTracking();
  
  return <>{children}</>;
}
