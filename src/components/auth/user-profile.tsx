"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { SignInButton } from "./sign-in-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <SignInButton />;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    router.refresh();
    setIsMenuOpen(false);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Avatar Trigger */}
      <Avatar 
        className="size-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsMenuOpen(true)}
      >
        <AvatarImage
          src={session.user?.image || ""}
          alt={session.user?.name || "User"}
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>
          {(
            session.user?.name?.[0] ||
            session.user?.email?.[0] ||
            "U"
          ).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleMenuClose}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 z-50 mt-1 w-56 bg-background border rounded-md shadow-lg">
            <div className="p-2">
              {/* User Info */}
              <div className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              
              {/* Separator */}
              <div className="bg-border -mx-1 my-1 h-px" />
              
              {/* Menu Items */}
              <Link 
                href="/profile" 
                className="flex items-center px-2 py-1.5 text-sm hover:bg-muted transition-colors rounded-sm"
                onClick={handleMenuClose}
              >
                <User className="mr-2 h-4 w-4" />
                Your Profile
              </Link>
              
              {/* Separator */}
              <div className="bg-border -mx-1 my-1 h-px" />
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-muted transition-colors rounded-sm text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
