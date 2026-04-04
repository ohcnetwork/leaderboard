import AvatarMosaic from "@/components/AvatarMosaic";
import RelativeTime from "@/components/RelativeTime";
import Time from "@/components/Time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfig } from "@/lib/config/get-config";
import {
  getActiveContributors,
  getAllContributorUsernames,
  getGlobalAggregates,
  getLeaderboard,
  getRecentActivitiesGroupedByType,
  getRecentBadgeAchievements,
} from "@/lib/data/loader";
import { formatAggregateValue, getDateRange } from "@/lib/utils";
import { format } from "date-fns";
import {
  Activity,
  ArrowRight,
  Award,
  ExternalLink,
  LucideIcon,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HomeActivityChart from "./HomeActivityChart";
import HomeActivityDonut from "./HomeActivityDonut";

const BUILTIN_GLOBAL_AGGREGATES: Record<
  string,
  { name: string; description: string; icon: LucideIcon }
> = {
  total_activities: {
    name: "Total Activities",
    description: "Last 30 days",
    icon: Activity,
  },
  count_contributors: {
    name: "Active Contributors",
    description: "Last 30 days",
    icon: Users,
  },
};

export default async function Home() {
  const config = getConfig();

  const { startDate: weekStart, endDate: weekEnd } = getDateRange("week");
  const { startDate: monthStart, endDate: monthEnd } = getDateRange("month");

  const hiddenRoles = Object.entries(config.leaderboard.roles)
    .filter(([, v]) => v.hidden)
    .map(([k]) => k);

  const [
    activityGroups90d,
    weeklyLeaderboard,
    recentBadges,
    activeContributors30d,
    allUsernames,
  ] = await Promise.all([
    getRecentActivitiesGroupedByType(90, hiddenRoles),
    getLeaderboard(weekStart, weekEnd),
    getRecentBadgeAchievements(6),
    getActiveContributors(30, hiddenRoles),
    getAllContributorUsernames(),
  ]);

  // --- Split 90 days into current 30 days and previous 30 days for trend comparison ---
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const allActivitiesFlat = activityGroups90d.flatMap((g) =>
    g.activities.map((a) => ({
      ...a,
      activity_name: g.activity_name,
    })),
  );

  const currentPeriodActivities = allActivitiesFlat.filter(
    (a) => new Date(a.occurred_at) >= thirtyDaysAgo,
  );
  const previousPeriodActivities = allActivitiesFlat.filter(
    (a) =>
      new Date(a.occurred_at) >= sixtyDaysAgo &&
      new Date(a.occurred_at) < thirtyDaysAgo,
  );

  // --- KPI stats with trends ---
  const totalActivities30d = currentPeriodActivities.length;
  const totalActivitiesPrev = previousPeriodActivities.length;

  const uniqueContributors30d = new Set(
    currentPeriodActivities.map((a) => a.contributor),
  ).size;
  const uniqueContributorsPrev = new Set(
    previousPeriodActivities.map((a) => a.contributor),
  ).size;

  const configuredAggregates = config.leaderboard.aggregates?.global || [
    "total_activities",
    "count_contributors",
  ];

  const builtinSlugs = configuredAggregates.filter(
    (s) => s in BUILTIN_GLOBAL_AGGREGATES,
  );
  const dbSlugs = configuredAggregates.filter(
    (s) => !(s in BUILTIN_GLOBAL_AGGREGATES),
  );
  const dbAggregates = await getGlobalAggregates(dbSlugs);

  function computeTrend(
    current: number,
    previous: number,
  ): { percentage: number; direction: "up" | "down" | "flat" } | null {
    if (previous === 0 && current === 0) return null;
    if (previous === 0)
      return { percentage: 100, direction: current > 0 ? "up" : "flat" };
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(change)),
      direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    };
  }

  interface AggregateCard {
    name: string;
    value: string;
    description: string;
    icon: LucideIcon;
    trend: { percentage: number; direction: "up" | "down" | "flat" } | null;
  }
  const aggregateCards: AggregateCard[] = [];

  for (const slug of builtinSlugs) {
    const def = BUILTIN_GLOBAL_AGGREGATES[slug]!;
    let value = "0";
    let trend: AggregateCard["trend"] = null;
    if (slug === "total_activities") {
      value = totalActivities30d.toLocaleString();
      trend = computeTrend(totalActivities30d, totalActivitiesPrev);
    } else if (slug === "count_contributors") {
      value = uniqueContributors30d.toString();
      trend = computeTrend(uniqueContributors30d, uniqueContributorsPrev);
    }
    aggregateCards.push({ ...def, value, trend });
  }

  for (const agg of dbAggregates) {
    if (agg.value) {
      aggregateCards.push({
        name: agg.name,
        value: formatAggregateValue(agg.value),
        description: agg.description || "",
        icon: TrendingUp,
        trend: null,
      });
    }
  }

  // --- Chart data: daily activity for last 30 days ---
  const dailyMap = new Map<string, { count: number; points: number }>();
  for (const a of currentPeriodActivities) {
    const dateKey = format(new Date(a.occurred_at), "yyyy-MM-dd");
    const existing = dailyMap.get(dateKey) || { count: 0, points: 0 };
    existing.count += 1;
    existing.points += a.points ?? 0;
    dailyMap.set(dateKey, existing);
  }
  const dailyActivity = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- Donut data: activity types (30 days) ---
  const activityTypeMap = new Map<
    string,
    { name: string; count: number; points: number }
  >();
  for (const g of activityGroups90d) {
    const current = g.activities.filter(
      (a) => new Date(a.occurred_at) >= thirtyDaysAgo,
    );
    if (current.length > 0) {
      activityTypeMap.set(g.activity_name, {
        name: g.activity_name,
        count: current.length,
        points: current.reduce((s, a) => s + (a.points ?? 0), 0),
      });
    }
  }
  const activityTypeData = Array.from(activityTypeMap.values());

  // --- Top 5 contributors this week (excluding hidden roles) ---
  const topContributors = weeklyLeaderboard
    .filter((e) => !hiddenRoles.includes(e.role))
    .slice(0, 5);

  // --- Recent flat activity list (max 12) ---
  const recentActivities = allActivitiesFlat
    .sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
    )
    .slice(0, 12);

  // --- Avatar mosaic ---
  const mosaicContributors = activeContributors30d.slice(0, 30);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-10 pb-24 lg:pb-8">
      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 via-background to-primary/10 border border-border/50 px-4 py-8 sm:px-10 sm:py-14">
        <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <Image
            src={config.org.logo_url}
            alt={config.org.name}
            width={56}
            height={56}
            className="rounded-xl shadow-md"
          />
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            {config.org.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-xl leading-relaxed">
            {config.org.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors no-underline"
            >
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Link>
            <Link
              href="/people"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-colors no-underline"
            >
              <Users className="h-4 w-4" />
              Meet the Team
            </Link>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* ========== KPI Stats with Trend Indicators ========== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {aggregateCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="pt-4 pb-3 sm:pt-5 sm:pb-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {card.name}
                  </span>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {card.trend && card.trend.direction !== "flat" ? (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        card.trend.direction === "up"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {card.trend.direction === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {card.trend.percentage}%
                    </span>
                  ) : null}
                  {card.description && (
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ========== Charts Row ========== */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Activity Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Daily activity over the last 30 days
            </p>
          </CardHeader>
          <CardContent>
            <HomeActivityChart
              dailyActivity={dailyActivity}
              startDate={monthStart}
              endDate={monthEnd}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Activity Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution by type (30 days)
            </p>
          </CardHeader>
          <CardContent>
            <HomeActivityDonut activityTypes={activityTypeData} />
          </CardContent>
        </Card>
      </section>

      {/* ========== Top Contributors Podium + Recent Badges ========== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Contributors with Podium */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-medal-gold" />
                Top Contributors
              </CardTitle>
              <Link
                href="/leaderboard"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 no-underline"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardHeader>
          <CardContent>
            {topContributors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activity this week yet
              </p>
            ) : (
              <div className="space-y-4">
                {/* Podium: top 3 */}
                {topContributors.length >= 3 && (
                  <div className="flex items-end justify-center gap-2 sm:gap-3 pt-4 pb-2">
                    {/* 2nd place - left */}
                    <PodiumEntry
                      entry={topContributors[1]!}
                      rank={2}
                      height="h-24"
                      avatarSize="h-12 w-12"
                    />
                    {/* 1st place - center */}
                    <PodiumEntry
                      entry={topContributors[0]!}
                      rank={1}
                      height="h-32"
                      avatarSize="h-14 w-14"
                    />
                    {/* 3rd place - right */}
                    <PodiumEntry
                      entry={topContributors[2]!}
                      rank={3}
                      height="h-20"
                      avatarSize="h-11 w-11"
                    />
                  </div>
                )}

                {/* Positions 4-5 (or all if < 3 total) */}
                {(topContributors.length < 3
                  ? topContributors
                  : topContributors.slice(3)
                ).map((entry, i) => {
                  const rank = topContributors.length < 3 ? i + 1 : i + 4;
                  return (
                    <Link
                      key={entry.username}
                      href={`/${entry.username}`}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors group no-underline"
                    >
                      <div className="flex items-center justify-center w-6 shrink-0">
                        {rank <= 3 ? (
                          <Trophy
                            className={`h-4 w-4 ${
                              rank === 1
                                ? "text-medal-gold"
                                : rank === 2
                                  ? "text-medal-silver"
                                  : "text-medal-bronze"
                            }`}
                          />
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">
                            {rank}
                          </span>
                        )}
                      </div>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          src={entry.avatar_url || undefined}
                          alt={entry.name || entry.username}
                        />
                        <AvatarFallback className="text-xs">
                          {(entry.name || entry.username)
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate group-hover:underline block">
                          {entry.name || entry.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.activity_count}{" "}
                          {entry.activity_count === 1
                            ? "activity"
                            : "activities"}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {entry.total_points}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          pts
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-badge-accent" />
                Recent Achievements
              </CardTitle>
              <Link
                href="/badges"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 no-underline"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Latest badges earned
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No badges earned yet
              </p>
            ) : (
              recentBadges.map((badge) => {
                const variant = badge.badge_variants?.[badge.variant];
                return (
                  <Link
                    key={badge.slug}
                    href={`/${badge.contributor}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors no-underline"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm">
                      {variant?.svg_url ? (
                        <img
                          src={variant.svg_url}
                          alt={badge.badge_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-badge-accent to-badge-accent/70" />
                      )}
                    </div>
                    <Avatar className="h-7 w-7 shrink-0 -ml-5 ring-2 ring-card">
                      <AvatarImage
                        src={badge.contributor_avatar_url || undefined}
                        alt={badge.contributor_name || badge.contributor}
                      />
                      <AvatarFallback className="text-[10px]">
                        {(badge.contributor_name || badge.contributor)
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {badge.contributor_name || badge.contributor}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        earned{" "}
                        <span className="font-medium">{badge.badge_name}</span>
                        {badge.variant !== "default" &&
                          badge.variant !== "bronze" && (
                            <span className="capitalize">
                              {" "}
                              ({badge.variant})
                            </span>
                          )}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/70 shrink-0">
                      <Time date={badge.achieved_on} variant="date" />
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      {/* ========== Contributor Avatar Mosaic ========== */}
      {mosaicContributors.length > 0 && (
        <section>
          <Link
            href="/people"
            className="group block rounded-xl border border-border hover:border-primary/30 p-4 sm:p-5 transition-all no-underline"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm font-semibold">Our Community</h3>
                <p className="text-xs text-muted-foreground">
                  {allUsernames.length.toLocaleString()} contributors building
                  together
                </p>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                Meet everyone
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <AvatarMosaic
              contributors={mosaicContributors}
              totalCount={allUsernames.length}
            />
          </Link>
        </section>
      )}

      {/* ========== Recent Activity Feed ========== */}
      <section>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Activity
              </CardTitle>
              <Link
                href="/leaderboard"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 no-underline"
              >
                View leaderboard
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No recent activities
              </p>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {recentActivities.map((a) => (
                  <div
                    key={a.slug}
                    className="flex items-start sm:items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/${a.contributor}`}
                      className="shrink-0 mt-0.5 sm:mt-0"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={a.contributor_avatar_url || undefined}
                          alt={a.contributor_name || a.contributor}
                        />
                        <AvatarFallback className="text-[10px]">
                          {(a.contributor_name || a.contributor)
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap overflow-hidden">
                      <Link
                        href={`/${a.contributor}`}
                        className="text-sm font-medium hover:underline shrink-0"
                      >
                        {a.contributor_name || a.contributor}
                      </Link>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {a.activity_name}
                      </span>
                      {a.title && (
                        <>
                          <span className="text-muted-foreground/40">
                            &middot;
                          </span>
                          {a.link ? (
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs truncate text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                            >
                              {a.title}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs truncate text-muted-foreground">
                              {a.title}
                            </span>
                          )}
                        </>
                      )}
                      {!a.title && a.link && (
                        <a
                          href={a.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground/60 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {a.points !== null && a.points > 0 && (
                      <span className="text-xs font-medium text-primary shrink-0">
                        +{a.points}
                      </span>
                    )}
                    <RelativeTime
                      date={a.occurred_at}
                      className="text-xs text-muted-foreground/70 shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ========== Quick Navigation ========== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/leaderboard"
          className="group rounded-xl border border-border p-4 sm:p-5 hover:border-primary/30 hover:bg-primary/5 transition-all no-underline"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Leaderboard</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            See who&apos;s leading this week, month, and year.
          </p>
        </Link>
        <Link
          href="/people"
          className="group rounded-xl border border-border p-4 sm:p-5 hover:border-primary/30 hover:bg-primary/5 transition-all no-underline"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">People</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Browse all contributors and their profiles.
          </p>
        </Link>
        <Link
          href="/badges"
          className="group rounded-xl border border-border p-4 sm:p-5 hover:border-primary/30 hover:bg-primary/5 transition-all no-underline"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Badges</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore achievements and milestones earned.
          </p>
        </Link>
      </section>
    </div>
  );
}

// --- Podium Entry Sub-component ---
interface PodiumEntryProps {
  entry: {
    username: string;
    name: string | null;
    avatar_url: string | null;
    total_points: number;
  };
  rank: number;
  height: string;
  avatarSize: string;
}

function PodiumEntry({ entry, rank, height, avatarSize }: PodiumEntryProps) {
  const pedestal =
    rank === 1
      ? "bg-medal-gold/10 border-medal-gold/30"
      : rank === 2
        ? "bg-medal-silver/10 border-medal-silver/30"
        : "bg-medal-bronze/10 border-medal-bronze/30";

  return (
    <Link
      href={`/${entry.username}`}
      className="flex flex-col items-center gap-1.5 group no-underline w-24 sm:w-28"
    >
      <Avatar className={`${avatarSize} ring-2 ring-card shadow-md`}>
        <AvatarImage
          src={entry.avatar_url || undefined}
          alt={entry.name || entry.username}
        />
        <AvatarFallback className="text-sm font-medium">
          {(entry.name || entry.username).substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium text-center truncate w-full group-hover:underline">
        {entry.name || entry.username}
      </span>
      <div
        className={`w-full ${height} rounded-t-lg border ${pedestal} flex flex-col items-center justify-center`}
      >
        <span className="text-lg font-bold text-primary">
          {entry.total_points}
        </span>
        <span className="text-[10px] text-muted-foreground">pts</span>
      </div>
    </Link>
  );
}
