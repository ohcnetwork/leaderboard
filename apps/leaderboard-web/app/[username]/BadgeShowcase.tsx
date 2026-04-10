"use client";

import Time from "@/components/Time";
import { cn } from "@/lib/utils";
import type {
  BadgeDefinition,
  ContributorBadge,
} from "@ohcnetwork/leaderboard-api";
import { Award, Check, ChevronDown, Lock } from "lucide-react";
import { useState } from "react";

interface BadgeShowcaseProps {
  badges: ContributorBadge[];
  badgeDefinitions: BadgeDefinition[];
}

const VARIANT_COLORS: Record<string, { bg: string; text: string }> = {
  bronze: {
    bg: "bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  silver: {
    bg: "bg-gray-500/10",
    text: "text-gray-500 dark:text-gray-300",
  },
  gold: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  platinum: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-300",
  },
};

const DEFAULT_VARIANT_COLOR = {
  bg: "bg-muted/30",
  text: "text-muted-foreground",
};

function getVariantColor(variant: string) {
  return VARIANT_COLORS[variant.toLowerCase()] || DEFAULT_VARIANT_COLOR;
}

export default function BadgeShowcase({
  badges,
  badgeDefinitions,
}: BadgeShowcaseProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group earned badges by badge definition slug
  const grouped = new Map<string, ContributorBadge[]>();
  for (const badge of badges) {
    const existing = grouped.get(badge.badge) || [];
    existing.push(badge);
    grouped.set(badge.badge, existing);
  }

  const entries = Array.from(grouped.entries());

  return (
    <div>
      {/* Mobile collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full md:hidden mb-3"
      >
        <Award className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Achievements</h2>
        <span className="text-xs text-muted-foreground ml-1">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground ml-auto transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-2 mb-4">
        <Award className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Achievements</h2>
        <span className="text-xs text-muted-foreground ml-1">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
        </span>
      </div>

      {/* Badge list — always visible on desktop, collapsible on mobile */}
      <div
        className={cn(
          "flex flex-col gap-3 overflow-hidden transition-all md:max-h-none! md:opacity-100!",
          isExpanded
            ? "max-h-500 opacity-100"
            : "max-h-0 opacity-0 md:max-h-none md:opacity-100",
        )}
      >
        {entries.map(([badgeSlug, earnedVariants]) => {
          const badgeDef = badgeDefinitions.find((d) => d.slug === badgeSlug);
          const variantOrder = badgeDef
            ? Object.entries(badgeDef.variants).sort(
                ([, a], [, b]) => (a.order || 0) - (b.order || 0),
              )
            : [];

          const earnedSet = new Set(earnedVariants.map((e) => e.variant));

          // Find highest earned variant for the hero display
          const highestEarned = [...variantOrder]
            .reverse()
            .find(([key]) => earnedSet.has(key));
          const highestVariantKey = highestEarned?.[0];
          const highestVariantDef = highestEarned?.[1];
          const highestColor = highestVariantKey
            ? getVariantColor(highestVariantKey)
            : DEFAULT_VARIANT_COLOR;

          return (
            <div
              key={badgeSlug}
              className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md"
            >
              {/* Badge header with hero SVG */}
              <div className="flex items-start gap-3 p-3 pb-2">
                <div className="relative shrink-0 size-12 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                  {highestVariantDef?.svg_url ? (
                    <img
                      src={highestVariantDef.svg_url}
                      alt={`${badgeDef?.name || badgeSlug} - ${highestVariantKey}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-linear-to-br from-primary/20 to-primary/5" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-semibold text-sm leading-tight">
                    {badgeDef?.name || badgeSlug}
                  </h3>
                  {badgeDef?.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {badgeDef.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className={cn("font-medium", highestColor.text)}>
                      {earnedVariants.length}
                    </span>
                    {" / "}
                    {variantOrder.length} tiers earned
                  </p>
                </div>
              </div>

              {/* Variant progression */}
              <div className="px-3 pb-3">
                <div className="flex flex-col gap-1">
                  {variantOrder.map(([variantKey, variantDef]) => {
                    const earned = earnedVariants.find(
                      (e) => e.variant === variantKey,
                    );
                    const isEarned = !!earned;
                    const color = getVariantColor(variantKey);

                    return (
                      <div
                        key={variantKey}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors",
                          isEarned ? color.bg : "opacity-50",
                        )}
                      >
                        {/* Variant icon */}
                        <div
                          className={cn(
                            "shrink-0 size-7 rounded-md overflow-hidden transition-all",
                            !isEarned && "grayscale",
                          )}
                        >
                          {variantDef.svg_url ? (
                            <img
                              src={variantDef.svg_url}
                              alt={variantKey}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full bg-linear-to-br from-muted to-muted/50" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              "text-xs font-semibold capitalize",
                              isEarned ? color.text : "text-muted-foreground",
                            )}
                          >
                            {variantKey}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {variantDef.description}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isEarned ? (
                            <>
                              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                <Time
                                  date={earned.achieved_on}
                                  variant="date"
                                />
                              </span>
                              <Check
                                className={cn("size-3.5", color.text)}
                                strokeWidth={3}
                              />
                            </>
                          ) : (
                            <Lock className="size-3 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
