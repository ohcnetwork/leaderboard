import Time from "@/components/Time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfig } from "@/lib/config/get-config";
import {
  getAllBadgeDefinitions,
  getBadgeAwardCounts,
  getRecentBadgeAchievements,
  getTopBadgeEarners,
  getTotalBadgeStats,
} from "@/lib/data/loader";
import { Award, Crown, Medal, Sparkles, Trophy, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();

  return {
    title: `Badges - ${config.org.name}`,
    description: `Explore all achievement badges and see who's earned them in the ${config.org.name} community. View badge requirements, recent achievements, and top badge earners.`,
    keywords: [
      "badges",
      "achievements",
      "awards",
      config.org.name,
      "leaderboard",
      "gamification",
    ],
  };
}

const VARIANT_ORDER: Record<string, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

const VARIANT_RING_COLORS: Record<string, string> = {
  bronze: "ring-medal-bronze/40",
  silver: "ring-medal-silver/40",
  gold: "ring-medal-gold/40",
  platinum: "ring-badge-accent/40",
};

const VARIANT_BG_COLORS: Record<string, string> = {
  bronze: "bg-medal-bronze/10",
  silver: "bg-medal-silver/10",
  gold: "bg-medal-gold/10",
  platinum: "bg-badge-accent/10",
};

export default async function BadgesPage() {
  const config = getConfig();

  const hiddenRoles = Object.entries(config.leaderboard.roles)
    .filter(([, v]) => v.hidden)
    .map(([k]) => k);

  const [
    badgeDefinitions,
    recentAchievements,
    topEarners,
    awardCounts,
    totalStats,
  ] = await Promise.all([
    getAllBadgeDefinitions(),
    getRecentBadgeAchievements(11, hiddenRoles),
    getTopBadgeEarners(10, hiddenRoles),
    getBadgeAwardCounts(hiddenRoles),
    getTotalBadgeStats(hiddenRoles),
  ]);

  // Build award count lookup: { badge_slug: { variant: count, _total: count } }
  const awardCountMap: Record<string, Record<string, number>> = {};
  for (const row of awardCounts) {
    if (!awardCountMap[row.badge]) {
      awardCountMap[row.badge] = { _total: 0 };
    }
    const entry = awardCountMap[row.badge]!;
    entry[row.variant] = row.award_count;
    entry._total = (entry._total ?? 0) + row.award_count;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-14 pb-24 lg:pb-8">
      {/* ========== Hero Section ========== */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-badge-accent/5 via-background to-badge-accent/10 border border-border/50 px-4 py-10 sm:px-10 sm:py-16">
        {/* Floating badge preview */}
        <div className="flex justify-center gap-3 sm:gap-5 mb-6">
          {badgeDefinitions.slice(0, 5).map((badge, i) => {
            // Pick the highest variant for each badge
            const variants = Object.entries(badge.variants).sort(
              ([a], [b]) => (VARIANT_ORDER[b] ?? 99) - (VARIANT_ORDER[a] ?? 99),
            );
            const [, topVariant] = variants[0] ?? [];
            return (
              <div
                key={badge.slug}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg ring-2 ring-badge-accent/20"
                style={{
                  animation: `podiumFloat 3s ease-in-out ${i * 0.4}s infinite`,
                }}
              >
                {topVariant?.svg_url ? (
                  <img
                    src={topVariant.svg_url}
                    alt={badge.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                )}
              </div>
            );
          })}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Achievement Badges
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-xl leading-relaxed">
            Earn badges by contributing to {config.org.name}. Complete
            challenges, reach milestones, and showcase your achievements.
          </p>
        </div>

        {/* Decorative blurs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-badge-accent/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-badge-accent/5 blur-3xl" />
      </section>

      {/* ========== Stats Bar ========== */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="pt-4 pb-3 sm:pt-5 sm:pb-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Badge Types
              </span>
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {badgeDefinitions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {badgeDefinitions.reduce(
                (sum, b) => sum + Object.keys(b.variants).length,
                0,
              )}{" "}
              variants
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-4 pb-3 sm:pt-5 sm:pb-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Badges Awarded
              </span>
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {totalStats.total_awarded.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-4 pb-3 sm:pt-5 sm:pb-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Badge Earners
              </span>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {totalStats.unique_earners.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unique contributors</p>
          </CardContent>
        </Card>
      </section>

      {/* ========== Top Earners + Recent Achievements ========== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Badge Earners */}
        {topEarners.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-medal-gold" />
                Top Badge Earners
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Contributors with the most badges
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Podium: top 3 */}
                {topEarners.length >= 3 && (
                  <div className="flex items-end justify-center gap-2 sm:gap-3 pt-4 pb-4">
                    <TopEarnerPodium earner={topEarners[1]!} rank={2} />
                    <TopEarnerPodium earner={topEarners[0]!} rank={1} />
                    <TopEarnerPodium earner={topEarners[2]!} rank={3} />
                  </div>
                )}

                {/* Remaining positions */}
                {(topEarners.length < 3 ? topEarners : topEarners.slice(3)).map(
                  (earner, i) => {
                    const rank = topEarners.length < 3 ? i + 1 : i + 4;
                    return (
                      <Link
                        key={earner.username}
                        href={`/${earner.username}`}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors group no-underline"
                      >
                        <div className="flex items-center justify-center w-6 shrink-0">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {rank}
                          </span>
                        </div>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage
                            src={earner.avatar_url || undefined}
                            alt={earner.name || earner.username}
                          />
                          <AvatarFallback className="text-xs">
                            {(earner.name || earner.username)
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate group-hover:underline block">
                            {earner.name || earner.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{earner.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Medal className="h-4 w-4 text-badge-accent" />
                          <span className="text-lg font-bold">
                            {earner.badge_count}
                          </span>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-badge-accent" />
                Recent Achievements
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Latest badges earned by contributors
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentAchievements.map((achievement) => {
                  const variant =
                    achievement.badge_variants?.[achievement.variant];
                  return (
                    <Link
                      key={achievement.slug}
                      href={`/${achievement.contributor}`}
                      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors no-underline group"
                    >
                      {/* Badge SVG */}
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm ring-1 ring-border">
                        {variant?.svg_url ? (
                          <img
                            src={variant.svg_url}
                            alt={achievement.badge_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                        )}
                      </div>

                      {/* Contributor avatar overlapping */}
                      <Avatar className="h-7 w-7 shrink-0 -ml-5 ring-2 ring-card">
                        <AvatarImage
                          src={achievement.contributor_avatar_url || undefined}
                          alt={
                            achievement.contributor_name ||
                            achievement.contributor
                          }
                        />
                        <AvatarFallback className="text-[10px]">
                          {(
                            achievement.contributor_name ||
                            achievement.contributor
                          )
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block group-hover:underline">
                          {achievement.contributor_name ||
                            achievement.contributor}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          earned{" "}
                          <span className="font-medium">
                            {achievement.badge_name}
                          </span>
                          {variant?.description && (
                            <span> &middot; {variant.description}</span>
                          )}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground/70 shrink-0">
                        <Time date={achievement.achieved_on} variant="date" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ========== Badge Gallery ========== */}
      <section>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-badge-accent/10">
            <Award className="h-5 w-5 text-badge-accent" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Badge Collection</h2>
            <p className="text-sm text-muted-foreground">
              All badges available to earn
            </p>
          </div>
        </div>

        {badgeDefinitions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No badges defined yet</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {badgeDefinitions.map((badge) => {
              const sortedVariants = Object.entries(badge.variants).sort(
                ([a], [b]) =>
                  (VARIANT_ORDER[a] ?? 99) - (VARIANT_ORDER[b] ?? 99),
              );
              const badgeCounts = awardCountMap[badge.slug] || { _total: 0 };

              return (
                <Card
                  key={badge.slug}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      {/* Hero badge image - largest variant */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-border">
                        {(() => {
                          const topVariant = sortedVariants.at(-1);
                          const svg = topVariant?.[1]?.svg_url;
                          return svg ? (
                            <img
                              src={svg}
                              alt={`${badge.name} - ${topVariant?.[0]}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl">
                          {badge.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {badge.description}
                        </p>
                        {(badgeCounts._total ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            Earned by{" "}
                            <span className="font-semibold text-foreground">
                              {badgeCounts._total}
                            </span>{" "}
                            {badgeCounts._total === 1
                              ? "contributor"
                              : "contributors"}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Variant progression row */}
                    <div className="flex flex-wrap gap-3">
                      {sortedVariants.map(([variantKey, variant]) => {
                        const count = badgeCounts[variantKey] ?? 0;
                        const ringColor =
                          VARIANT_RING_COLORS[variantKey] ?? "ring-border";
                        const bgColor =
                          VARIANT_BG_COLORS[variantKey] ?? "bg-muted/50";

                        return (
                          <div
                            key={variantKey}
                            className={`flex items-center gap-3 flex-1 min-w-[calc(50%-0.75rem)] p-3 rounded-xl ${bgColor} border border-border/50`}
                          >
                            <div
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 ring-2 ${ringColor} shadow-sm`}
                            >
                              {variant.svg_url ? (
                                <img
                                  src={variant.svg_url}
                                  alt={`${badge.name} - ${variantKey}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold capitalize">
                                {variantKey}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {variant.description}
                              </div>
                              {count > 0 && (
                                <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                                  {count} {count === 1 ? "earner" : "earners"}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ========== Back to Home ========== */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

// --- Top Earner Podium Sub-component ---
function TopEarnerPodium({
  earner,
  rank,
}: {
  earner: {
    username: string;
    name: string | null;
    avatar_url: string | null;
    badge_count: number;
  };
  rank: number;
}) {
  const heights: Record<number, string> = {
    1: "h-28",
    2: "h-20",
    3: "h-16",
  };
  const avatarSizes: Record<number, string> = {
    1: "h-14 w-14",
    2: "h-12 w-12",
    3: "h-11 w-11",
  };
  const pedestal =
    rank === 1
      ? "bg-medal-gold/10 border-medal-gold/30"
      : rank === 2
        ? "bg-medal-silver/10 border-medal-silver/30"
        : "bg-medal-bronze/10 border-medal-bronze/30";

  return (
    <Link
      href={`/${earner.username}`}
      className="flex flex-col items-center gap-1.5 group no-underline w-24 sm:w-28"
    >
      <Avatar className={`${avatarSizes[rank]} ring-2 ring-card shadow-md`}>
        <AvatarImage
          src={earner.avatar_url || undefined}
          alt={earner.name || earner.username}
        />
        <AvatarFallback className="text-sm font-medium">
          {(earner.name || earner.username).substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium text-center truncate w-full group-hover:underline">
        {earner.name || earner.username}
      </span>
      <div
        className={`w-full ${heights[rank]} rounded-t-lg border ${pedestal} flex flex-col items-center justify-center`}
        style={{
          animation: `podiumRise 0.6s ease-out ${rank === 1 ? "0s" : rank === 2 ? "0.15s" : "0.3s"} both`,
        }}
      >
        <div className="flex items-center gap-1">
          <Medal className="h-4 w-4 text-badge-accent" />
          <span className="text-lg font-bold text-primary">
            {earner.badge_count}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">badges</span>
      </div>
    </Link>
  );
}
