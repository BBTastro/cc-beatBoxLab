"use client";

import { useSession } from "@/lib/auth-client";
import { ChallengeProvider } from "@/contexts/ChallengeContext";
import { Chatbot } from "@/components/chatbot";

export function GlobalChatbot() {
  const { data: session } = useSession();

  // Only render chatbot if user is authenticated
  if (!session?.user) {
    return null;
  }

  return (
    <ChallengeProvider userId={session.user.id}>
      <Chatbot userId={session.user.id} />
    </ChallengeProvider>
  );
}
