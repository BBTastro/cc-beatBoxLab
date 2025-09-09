"use client";

import { useSession } from "@/lib/auth-client";
import { AuthenticationPage } from "@/components/auth/authentication-page";
import { redirect } from 'next/navigation';

export default function Home() {
  const { data: session, isPending: authLoading } = useSession();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to beats page
  if (session?.user) {
    redirect('/beats');
  }

  // If user is not authenticated, show the landing page with invite form
  return <AuthenticationPage />;
}
