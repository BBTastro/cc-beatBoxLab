"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Speaker, ListChecks, MoveRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  {
    href: "/beats",
    label: "beats",
    icon: Speaker,
  },
  {
    href: "/details",
    label: "Details", 
    icon: ListChecks,
  },
  {
    href: "/move",
    label: "Move",
    icon: MoveRight,
  },
  {
    href: "/rewards",
    label: "Rewards",
    icon: Target,
  },
];

export function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 min-w-0 flex-1 py-2 px-1 rounded-md transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className={cn(
                  "text-xs font-medium truncate",
                  isActive && "text-primary"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </footer>
  );
}
