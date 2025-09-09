"use client";

import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { trackUserSignIn, setCurrentSession } from "@/lib/user-tracking";

export function SignInButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Button disabled size="sm">Loading...</Button>;
  }

  if (session) {
    return null;
  }

  return (
    <Button
      size="sm"
      onClick={async () => {
        try {
          const result = await signIn.social({
            provider: "google",
            callbackURL: "/beats",
          });
          
          if (result) {
            console.log("Sign-in successful:", result);
            // Track user sign-in (this will be called after redirect)
            // The actual tracking will happen in the auth callback
          }
        } catch (error) {
          console.error("Sign-in error:", error);
          alert("Sign-in failed: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }}
    >
      Sign in
    </Button>
  );
}
