"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { APPROVED_EMAILS } from "@/lib/constants";

export function EmailValidator({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session?.user?.email) {
      const userEmail = session.user.email.toLowerCase();
      
      console.log("EmailValidator: Checking email:", userEmail);
      
      if (!APPROVED_EMAILS.includes(userEmail)) {
        console.log("EmailValidator: Access denied for email:", userEmail);
        
        // Sign out the user immediately
        import("@/lib/auth-client").then(({ signOut }) => {
          signOut();
        });
        
        // Show error message
        alert(`Access denied. Email ${userEmail} is not authorized to access this application.`);
      } else {
        console.log("EmailValidator: Access granted for email:", userEmail);
      }
    }
  }, [session, isPending]);

  // If user is not authorized, don't render children
  if (!isPending && session?.user?.email) {
    const userEmail = session.user.email.toLowerCase();
    if (!APPROVED_EMAILS.includes(userEmail)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              Your email ({session.user.email}) is not authorized to access this application.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
