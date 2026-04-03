import { ContributorRoleBadge } from "@/components/ContributorRoleBadge";
import RelativeTime from "@/components/RelativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfig } from "@/lib/config/get-config";
import {
  getAllActivityDefinitions,
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
  LucideIcon,
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
  activity_types: {
    name: "Activity Types",
    description: "Tracked categories",
    icon: TrendingUp,
  },
};

export default async function Home() {
  const config = getConfig();

  const { startDate: weekStart, endDate: weekEnd } = getDateRange("week");
  const { startDate: monthStart, endDate: monthEnd } = getDateRange("month");

  const [
    activityGroups30d,
    weeklyLeaderboard,
    recentBadges,
    activityDefinitions,
  ] = await Promise.all([
    getRecentActivitiesGroupedByType(30),
    getLeaderboard(weekStart, weekEnd),
    getRecentBadgeAchievements(6),
    getAllActivityDefinitions(),
  ]);

  // --- KPI stats ---
  const totalActivities30d = activityGroups30d.reduce(
    (sum, g) => sum + g.activities.length,
    0,
  );
  const uniqueContributors30d = new Set(
    activityGroups30d.flatMap((g) => g.activities.map((a) => a.contributor)),
  ).size;
  const totalActivityTypes = activityDefinitions.length;

  const configuredAggregates = config.leaderboard.aggregates?.global || [
    "total_activities",
    "count_contributors",
    "activity_types",
  ];

  const builtinSlugs = configuredAggregates.filter(
    (s) => s in BUILTIN_GLOBAL_AGGREGATES,
  );
  const dbSlugs = configuredAggregates.filter(
    (s) => !(s in BUILTIN_GLOBAL_AGGREGATES),
  );
  const dbAggregates = await getGlobalAggregates(dbSlugs);

  interface AggregateCard {
    name: string;
    value: string;
    description: string;
    icon: LucideIcon;
  }
  const aggregateCards: AggregateCard[] = [];

  for (const slug of builtinSlugs) {
    const def = BUILTIN_GLOBAL_AGGREGATES[slug]!;
    let value = "0";
    if (slug === "total_activities") value = totalActivities30d.toString();
    else if (slug === "count_contributors")
      value = uniqueContributors30d.toString();
    else if (slug === "activity_types") value = totalActivityTypes.toString();
    aggregateCards.push({ ...def, value });
  }

  for (const agg of dbAggregates) {
    if (agg.value) {
      aggregateCards.push({
        name: agg.name,
        value: formatAggregateValue(agg.value),
        description: agg.description || "",
        icon: TrendingUp,
      });
    }
  }

  // --- Chart data: daily activity for last 30 days ---
  const dailyMap = new Map<string, { count: number; points: number }>();
  for (const group of activityGroups30d) {
    for (const a of group.activities) {
      const dateKey = format(new Date(a.occured_at), "yyyy-MM-dd");
      const existing = dailyMap.get(dateKey) || { count: 0, points: 0 };
      existing.count += 1;
      existing.points += a.points ?? 0;
      dailyMap.set(dateKey, existing);
    }
  }
  const dailyActivity = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- Donut data: activity types ---
  const activityTypeData = activityGroups30d.map((g) => ({
    name: g.activity_name,
    count: g.activities.length,
    points: g.activities.reduce((s, a) => s + (a.points ?? 0), 0),
  }));

  // --- Top 5 contributors this week ---
  const topContributors = weeklyLeaderboard.slice(0, 5);

  const hiddenRoles = Object.entries(config.leaderboard.roles)
    .filter(([, v]) => v.hidden)
    .map(([k]) => k);

  // --- Recent flat activity list (last 7 days, max 12) ---
  const recentActivities = activityGroups30d
    .flatMap((g) =>
      g.activities.map((a) => ({
        ...a,
        activity_name: g.activity_name,
      })),
    )
    .filter((a) => !hiddenRoles.includes(a.contributor_role))
    .sort(
      (a, b) =>
        new Date(b.occured_at).getTime() - new Date(a.occured_at).getTime(),
    )
    .slice(0, 12);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 via-background to-primary/10 border border-border/50 px-6 py-10 sm:px-10 sm:py-14">
        <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
          <Image
            src={config.org.logo_url}
            alt={config.org.name}
            width={56}
            height={56}
            className="rounded-xl shadow-md"
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {config.org.name}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            {config.org.description}
          </p>
          <div className="flex gap-3 mt-2">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors no-underline"
            >
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Link>
            <Link
              href="/people"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-colors no-underline"
            >
              <Users className="h-4 w-4" />
              Meet the Team
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* ========== KPI Stats ========== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {aggregateCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {card.name}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <div className="text-3xl font-bold tracking-tight">
                  {card.value}
                </div>
                {card.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ========== Charts Row ========== */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Trend -- wider */}
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

        {/* Activity Breakdown Donut */}
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

      {/* ========== Top Contributors + Recent Badges ========== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
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
          <CardContent className="space-y-1">
            {topContributors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activity this week yet
              </p>
            ) : (
              topContributors.map((entry, index) => {
                const rank = index + 1;
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate group-hover:underline">
                          {entry.name || entry.username}
                        </span>
                        {!hiddenRoles.includes(entry.role) && (
                          <ContributorRoleBadge
                            role={entry.role}
                            roleName={
                              config.leaderboard.roles[entry.role]?.name
                            }
                          />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.activity_count}{" "}
                        {entry.activity_count === 1 ? "activity" : "activities"}
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
              })
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
                    {/* Badge icon */}
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
                    {/* Contributor avatar */}
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
                      {format(new Date(badge.achieved_on), "MMM d")}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

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
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <Link href={`/${a.contributor}`} className="shrink-0">
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
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
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
                              className="text-xs truncate text-muted-foreground hover:text-foreground"
                            >
                              {a.title}
                            </a>
                          ) : (
                            <span className="text-xs truncate text-muted-foreground">
                              {a.title}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {a.points !== null && a.points > 0 && (
                      <span className="text-xs font-medium text-primary shrink-0">
                        +{a.points}
                      </span>
                    )}
                    <RelativeTime
                      date={a.occured_at}
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
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/leaderboard"
          className="group rounded-xl border border-border p-5 hover:border-primary/30 hover:bg-primary/5 transition-all no-underline"
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
          className="group rounded-xl border border-border p-5 hover:border-primary/30 hover:bg-primary/5 transition-all no-underline"
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
          className="group rounded-xl border border-border p-5 hover:border-primary/30 hover:bg-primary/5 transition-all no-underline"
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
