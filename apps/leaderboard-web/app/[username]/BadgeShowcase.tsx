"use client";

import Time from "@/components/Time";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  BadgeDefinition,
  ContributorBadge,
} from "@ohcnetwork/leaderboard-api";

interface BadgeShowcaseProps {
  badges: ContributorBadge[];
  badgeDefinitions: BadgeDefinition[];
}

export default function BadgeShowcase({
  badges,
  badgeDefinitions,
}: BadgeShowcaseProps) {
  // Group earned badges by badge definition slug
  const grouped = new Map<string, ContributorBadge[]>();
  for (const badge of badges) {
    const existing = grouped.get(badge.badge) || [];
    existing.push(badge);
    grouped.set(badge.badge, existing);
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
      {Array.from(grouped.entries()).map(([badgeSlug, earnedVariants]) => {
        const badgeDef = badgeDefinitions.find((d) => d.slug === badgeSlug);
        const variantOrder = badgeDef
          ? Object.entries(badgeDef.variants).sort(
              ([, a], [, b]) => (a.order || 0) - (b.order || 0),
            )
          : [];

        // Sort earned variants by their definition order (highest last)
        const sortedEarned = [...earnedVariants].sort((a, b) => {
          const aOrder = variantOrder.findIndex(([k]) => k === a.variant) ?? 0;
          const bOrder = variantOrder.findIndex(([k]) => k === b.variant) ?? 0;
          return bOrder - aOrder;
        });

        // Display the highest-tier earned variant as the main icon
        const highest = sortedEarned[0];
        if (!highest) return null;
        const highestVariantDef = badgeDef?.variants[highest.variant];
        const svgUrl = highestVariantDef?.svg_url;

        return (
          <Tooltip key={badgeSlug}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-2 focus:outline-none"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  {svgUrl ? (
                    <img
                      src={svgUrl}
                      alt={`${badgeDef?.name || badgeSlug} - ${highest.variant}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-popover text-popover-foreground border border-border w-64 p-0 rounded-lg shadow-xl"
            >
              <div className="p-3 border-b border-border">
                <div className="font-semibold text-sm">
                  {badgeDef?.name || badgeSlug}
                </div>
                {badgeDef?.description && (
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {badgeDef.description}
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1">
                {variantOrder.map(([variantKey, variantDef]) => {
                  const earned = earnedVariants.find(
                    (e) => e.variant === variantKey,
                  );
                  return (
                    <div
                      key={variantKey}
                      className={`flex items-center gap-2.5 p-1.5 rounded-md ${
                        earned ? "opacity-100" : "opacity-30 grayscale"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        {variantDef.svg_url ? (
                          <img
                            src={variantDef.svg_url}
                            alt={`${variantKey}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium capitalize">
                          {variantKey}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {variantDef.description}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground shrink-0">
                        {earned ? (
                          <Time date={earned.achieved_on} variant="date" />
                        ) : (
                          <span className="italic">Locked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
