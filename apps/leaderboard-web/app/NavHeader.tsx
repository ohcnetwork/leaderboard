"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Award, Github, Home, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeSelector from "./ThemeSelector";

const SCROLL_THRESHOLD = 50;

function useScrollState() {
  const lastScrollY = useRef(0);
  const [direction, setDirection] = useState<"up" | "down" | "idle">("idle");
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setDirection("up");
      }
      setIsPastThreshold(currentScrollY > SCROLL_THRESHOLD);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { direction, isPastThreshold };
}

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "People", href: "/people", icon: Users },
  { name: "Badges", href: "/badges", icon: Award },
];

interface NavHeaderProps {
  orgName: string;
  logoUrl: string;
  githubUrl?: string;
}

export default function NavHeader({
  orgName,
  logoUrl,
  githubUrl,
}: NavHeaderProps) {
  const pathname = usePathname();
  const { isPastThreshold } = useScrollState();

  // Desktop: collapse to pill when scrolled past threshold
  const isCollapsed = isPastThreshold;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar - logo + actions only */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt={orgName}
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-semibold text-base">{orgName}</span>
          </Link>

          <div className="flex items-center gap-2">
            {githubUrl && (
              <Button
                asChild
                size="icon"
                variant="ghost"
                className="h-9 w-9 p-0 rounded-lg"
              >
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Desktop Navbar */}
      <header
        className={cn(
          "hidden lg:block fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out",
          isCollapsed ? "top-4 w-auto" : "top-4 w-[95%] max-w-7xl",
        )}
      >
        {/* Expanded full navbar */}
        <div
          className={cn(
            "rounded-full overflow-hidden",
            isCollapsed
              ? "opacity-0 scale-95 h-0 pointer-events-none"
              : "opacity-100 scale-100 h-14",
          )}
        >
          <div className="px-4 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logoUrl}
                alt={orgName}
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-semibold text-lg text-foreground">
                {orgName}
              </span>
            </Link>

            {/* Nav Links - centered pill container */}
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-background/30 backdrop-blur-md">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                      active
                        ? "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: GitHub + Theme Toggle */}
            <div className="flex items-center gap-3">
              {githubUrl && (
                <Button
                  asChild
                  size="icon"
                  variant="outline"
                  className="size-10 rounded-xl"
                >
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Github className="h-4.25 w-4.25" />
                  </a>
                </Button>
              )}
              <ThemeSelector />
            </div>
          </div>
        </div>

        {/* Collapsed pill navbar */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border border-border bg-background/90 backdrop-blur-xl shadow-xl p-1 transition-all duration-500 ease-in-out justify-evenly",
            isCollapsed
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none h-0 overflow-hidden p-0 border-0",
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-full transition-all",
                  active
                    ? "bg-primary/20 text-primary dark:text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile Bottom Navbar - always visible */}
      <nav className="lg:hidden fixed left-1/2 -translate-x-1/2 z-50 bottom-1">
        <div className="flex items-center gap-2 rounded-2xl bg-card border border-border shadow-2xl px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-12",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium leading-none">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
