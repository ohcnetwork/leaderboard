"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, Award, Github, Home, Trophy, Users } from "lucide-react";
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
  const { isPastThreshold, direction } = useScrollState();

  // Desktop: collapse to pill when scrolled past threshold
  const isCollapsed = isPastThreshold;

  const isScrollingDown = direction === "down" && isPastThreshold;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                variant="outline"
                className="size-9 rounded-xl"
              >
                <Link
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="size-4.25" />
                </Link>
              </Button>
            )}
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Desktop Expanded Navbar */}
      <header
        className={cn(
          "hidden lg:block fixed left-1/2 -translate-x-1/2 z-50 top-4 w-[95%] max-w-7xl transition-all duration-500 ease-in-out",
          isCollapsed
            ? "opacity-0 pointer-events-none -translate-y-20"
            : "opacity-100 translate-y-0",
        )}
      >
        <div className="rounded-full">
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
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <Github className="size-4.25" />
                  </Link>
                </Button>
              )}
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Collapsed pill navbar */}
      <header
        className={cn(
          "hidden lg:block fixed left-1/2 -translate-x-1/2 z-50 top-4 transition-all duration-500 ease-in-out w-2/7 max-w-4xl",
          isCollapsed
            ? "opacity-100"
            : "-translate-y-20 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/90 backdrop-blur-xl shadow-xl p-1 justify-evenly">
          <Link href="/">
            <Image
              src={logoUrl}
              alt={orgName}
              width={32}
              height={32}
              className="rounded-md ml-3"
            />
          </Link>
          <div className="w-px h-5 bg-border mx-2" />
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

      {/* Mobile Bottom Navbar */}
      <nav
        className={cn(
          "lg:hidden fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out",
          isScrollingDown
            ? "bottom-0 translate-y-full opacity-0 pointer-events-none"
            : "bottom-1 translate-y-0 opacity-100",
        )}
      >
        <div className="flex items-center gap-2 rounded-xl bg-card border border-border shadow-2xl px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-12",
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

      {/* Scroll to Top Button */}
      <Button
        variant="outline"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={cn(
          "fixed right-4 z-50 flex items-center justify-center size-10 rounded-full bg-card border border-border shadow-2xl transition-opacity ease-in-out lg:bottom-4 cursor-pointer",
          isPastThreshold
            ? "bottom-2 opacity-100"
            : "bottom-0 opacity-0 pointer-events-none",
          !isScrollingDown && "bottom-16",
        )}
      >
        <ArrowUp className="size-5" />
      </Button>
    </>
  );
}
