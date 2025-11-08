import Link from "next/link";
import { getConfig } from "@/lib/config";
import ThemeSelector from "@/app/ThemeSelector";
import { Users, Trophy, Activity, Home } from "lucide-react";

export function Navigation() {
  const config = getConfig();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {config.org.logo_url && (
              <img
                src={config.org.logo_url}
                alt={config.org.name}
                className="h-8 w-8 object-contain"
              />
            )}
            <span className="hidden sm:inline-block">{config.org.name}</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            <Link
              href="/people"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">People</span>
            </Link>
            <Link
              href="/feed"
              className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </Link>
          </nav>
        </div>
        <ThemeSelector />
      </div>
    </header>
  );
}
