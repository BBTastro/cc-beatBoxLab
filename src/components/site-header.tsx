"use client";

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { UserProfile } from "@/components/auth/user-profile"

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown Menu */}
      <div className="absolute top-full right-0 z-50 mt-1 w-48 bg-background border rounded-md shadow-lg">
        <nav className="py-2">
          <Link 
            href="/motivation" 
            className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
            onClick={onClose}
          >
            Motivation
          </Link>
          <Link 
            href="/allies" 
            className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
            onClick={onClose}
          >
            Allies
          </Link>
          <Link 
            href="/about" 
            className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
            onClick={onClose}
          >
            About
          </Link>
          <Link 
            href="/settings" 
            className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
            onClick={onClose}
          >
            Settings
          </Link>
        </nav>
      </div>
    </>
  );
}

// Dieter Herman toggle removed from header - will be in settings page

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex h-14 items-center">
          {/* Left side - Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl font-bold">
                beatBox
              </span>
            </Link>
          </div>

          {/* Right side - Theme toggle, user menu, and hamburger menu */}
          <div className="flex flex-1 items-center justify-end space-x-2 relative">
            <ModeToggle />
            <UserProfile />
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* Hamburger Menu positioned relative to this container */}
              <HamburgerMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
