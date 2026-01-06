import React from "react";
import Image from "next/image";

type BadgeVariant = {
  description: string;
  svg_url: string;
  order?: number;
};

type BadgeDefinition = {
  slug: string;
  name: string;
  description: string;
  variants: Record<string, BadgeVariant>;
};

interface BadgeDisplayProps {
  badge: {
    slug: string;
    badge: string;
    contributor: string;
    variant: string;
    achieved_on: string | Date;
    meta: Record<string, unknown> | null;
    badge_name?: string;
    badge_description?: string;
    badge_variants?: Record<string, BadgeVariant>;
  };
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

/**
 * Display a single badge with its icon and variant
 */
export function BadgeDisplay({
  badge,
  size = "md",
  showDetails = false,
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-24 h-24 text-base",
  };

  const variant = badge.badge_variants?.[badge.variant];
  const achievedDate = typeof badge.achieved_on === "string" 
    ? new Date(badge.achieved_on) 
    : badge.achieved_on;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer relative group`}
        title={`${badge.badge_name || badge.badge} - ${variant?.description || badge.variant}`}
      >
        {/* Badge SVG Image */}
        {variant?.svg_url ? (
          <img
            src={variant.svg_url}
            alt={`${badge.badge_name || badge.badge} - ${badge.variant}`}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Fallback gradient */
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600" />
        )}

        {/* Variant indicator */}
        {badge.variant !== "bronze" && badge.variant !== "default" && (
          <span className="absolute -bottom-1 -right-1 bg-white text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-amber-600 capitalize">
            {badge.variant.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Tooltip on hover */}
        {showDetails && (
          <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
            <div className="font-bold">{badge.badge_name || badge.badge}</div>
            <div className="text-gray-300 mt-1 capitalize">
              {variant?.description || badge.variant}
            </div>
            <div className="text-gray-400 mt-1 text-xs">
              Earned: {achievedDate.toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="text-center">
          <div className="font-medium text-sm">{badge.badge_name || badge.badge}</div>
          {badge.variant !== "default" && (
            <div className="text-xs text-gray-500 capitalize">{badge.variant}</div>
          )}
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: Array<{
    slug: string;
    badge: string;
    contributor: string;
    variant: string;
    achieved_on: string | Date;
    meta: Record<string, unknown> | null;
    badge_name?: string;
    badge_description?: string;
    badge_variants?: Record<string, BadgeVariant>;
  }>;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  groupByCategory?: boolean;
}

/**
 * Display a grid of badges, optionally grouped by category
 */
export function BadgeGrid({
  badges,
  size = "md",
  showDetails = false,
  groupByCategory = false,
}: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🏆</div>
        <div>No badges earned yet</div>
      </div>
    );
  }

  if (!groupByCategory) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {badges.map((badge) => (
          <BadgeDisplay
            key={badge.slug}
            badge={badge}
            size={size}
            showDetails={showDetails}
          />
        ))}
      </div>
    );
  }

  // Group badges by badge type (badge slug)
  const grouped = badges.reduce((acc, badge) => {
    const category = badge.badge_name || badge.badge;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryBadges]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {categoryBadges.map((badge) => (
              <BadgeDisplay
                key={badge.slug}
                badge={badge}
                size={size}
                showDetails={showDetails}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface BadgeProgressProps {
  badgeDefinition: BadgeDefinition;
  earnedVariants: string[];
  currentProgress?: {
    variant: string;
    current: number;
    required: number;
  };
}

/**
 * Display badge progress showing earned variants and next milestone
 */
export function BadgeProgress({
  badgeDefinition,
  earnedVariants,
  currentProgress,
}: BadgeProgressProps) {
  const variants = Object.entries(badgeDefinition.variants);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h4 className="font-semibold">{badgeDefinition.name}</h4>
          <p className="text-sm text-gray-600">{badgeDefinition.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {variants.map(([variantKey, variant]) => {
          const isEarned = earnedVariants.includes(variantKey);
          const isNext = !isEarned && currentProgress?.variant === variantKey;

          return (
            <div
              key={variantKey}
              className={`flex items-center gap-3 p-2 rounded ${
                isEarned
                  ? "bg-green-50 border border-green-200"
                  : isNext
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm">
                {isEarned ? "✓" : variantKey}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{variant.description}</div>
                {isNext && currentProgress && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (currentProgress.current /
                                currentProgress.required) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-600">
                        {currentProgress.current} / {currentProgress.required}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RecentBadgeAchievementProps {
  achievement: {
    slug: string;
    badge: string;
    contributor: string;
    variant: string;
    achieved_on: string | Date;
    contributor_name: string | null;
    contributor_avatar_url: string | null;
    badge_name: string;
    badge_variants: Record<string, BadgeVariant>;
  };
}

/**
 * Display a recent badge achievement with contributor info
 */
export function RecentBadgeAchievement({
  achievement,
}: RecentBadgeAchievementProps) {
  const achievedDate = typeof achievement.achieved_on === "string" 
    ? new Date(achievement.achieved_on) 
    : achievement.achieved_on;
  const variant = achievement.badge_variants[achievement.variant];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
      {achievement.contributor_avatar_url ? (
        <img
          src={achievement.contributor_avatar_url}
          alt={achievement.contributor_name || achievement.contributor}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
      )}

      {/* Badge Icon */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        {variant?.svg_url ? (
          <img
            src={variant.svg_url}
            alt={achievement.badge_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {achievement.contributor_name || achievement.contributor}
        </div>
        <div className="text-xs text-gray-500">
          earned{" "}
          <span className="font-medium capitalize">
            {achievement.badge_name} ({achievement.variant})
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        {achievedDate.toLocaleDateString()}
      </div>
    </div>
  );
}
