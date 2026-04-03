"use client";

import { ContributorRoleBadge } from "@/components/ContributorRoleBadge";
import Icon from "@/components/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeaderboardEntry } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import type { ActivityDefinition } from "@ohcnetwork/leaderboard-api";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Filter,
  Minus,
  Search,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ActivityTrendChart from "./ActivityTrendChart";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  previousEntries: LeaderboardEntry[];
  allTimeEntries: LeaderboardEntry[];
  period: "week" | "month" | "year";
  startDate: Date;
  endDate: Date;
  topByActivity: Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  >;
  activityDefinitions: ActivityDefinition[];
  podiumActivities: PodiumActivity[];
  hiddenRoles: string[];
  roles: Record<string, { name: string; description?: string }>;
}

interface PodiumActivity {
  slug: string;
  contributor: string;
  contributor_name: string | null;
  contributor_avatar_url: string | null;
  activity_definition: string;
  activity_name: string;
  activity_icon: string | null;
  title: string | null;
  occured_at: string;
  link: string | null;
  points: number | null;
}

type RankChange =
  | { type: "new" }
  | { type: "returned" }
  | { type: "up"; value: number }
  | { type: "down"; value: number }
  | { type: "same" };

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

const PREV_PERIOD_LABELS: Record<string, string> = {
  week: "vs. last week",
  month: "vs. last month",
  year: "vs. last year",
};

const PERIOD_NOUN: Record<string, string> = {
  week: "last week",
  month: "last month",
  year: "last year",
};

export default function LeaderboardView({
  entries,
  previousEntries,
  allTimeEntries,
  period,
  startDate,
  endDate,
  topByActivity,
  activityDefinitions,
  podiumActivities,
  hiddenRoles,
  roles,
}: LeaderboardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const defaultRoles = useMemo(() => {
    const allRoles = new Set<string>();
    entries.forEach((entry) => {
      if (!hiddenRoles.includes(entry.role)) {
        allRoles.add(entry.role);
      }
    });
    return allRoles;
  }, [entries, hiddenRoles]);

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(defaultRoles);

  const availableRoles = useMemo(() => {
    const roleSet = new Set<string>();
    entries.forEach((entry) => roleSet.add(entry.role));
    return Array.from(roleSet).sort();
  }, [entries]);

  const roleFilteredEntries = useMemo(() => {
    if (selectedRoles.size > 0) {
      return entries.filter((entry) => selectedRoles.has(entry.role));
    }
    return entries;
  }, [entries, selectedRoles]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    roleFilteredEntries.forEach((entry, index) => {
      map.set(entry.username, index + 1);
    });
    return map;
  }, [roleFilteredEntries]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return roleFilteredEntries;
    const query = searchQuery.toLowerCase();
    return roleFilteredEntries.filter((entry) => {
      const name = (entry.name || entry.username).toLowerCase();
      const username = entry.username.toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [roleFilteredEntries, searchQuery]);

  const toggleRole = (role: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(role)) {
      newSelected.delete(role);
    } else {
      newSelected.add(role);
    }
    setSelectedRoles(newSelected);
  };

  const isFiltering =
    searchQuery.trim().length > 0 || selectedRoles.size !== defaultRoles.size;

  const clearFilters = () => {
    setSelectedRoles(defaultRoles);
    setSearchQuery("");
  };

  const filteredTopByActivity = useMemo(() => {
    if (selectedRoles.size === 0) return topByActivity;
    const filtered: typeof topByActivity = {};
    for (const [activityName, contributors] of Object.entries(topByActivity)) {
      const filteredContributors = contributors.filter((contributor) => {
        const entry = entries.find((e) => e.username === contributor.username);
        return entry && selectedRoles.has(entry.role);
      });
      if (filteredContributors.length > 0) {
        filtered[activityName] = filteredContributors;
      }
    }
    return filtered;
  }, [topByActivity, selectedRoles, entries]);

  const previousEntriesMap = useMemo(() => {
    const map = new Map<string, { rank: number; total_points: number }>();
    previousEntries.forEach((entry, index) => {
      map.set(entry.username, {
        rank: index + 1,
        total_points: entry.total_points,
      });
    });
    return map;
  }, [previousEntries]);

  const allTimeEntriesMap = useMemo(() => {
    const map = new Map<string, { total_points: number }>();
    allTimeEntries.forEach((entry) => {
      map.set(entry.username, { total_points: entry.total_points });
    });
    return map;
  }, [allTimeEntries]);

  function getRankChange(username: string, currentRank: number): RankChange {
    const prev = previousEntriesMap.get(username);
    if (prev) {
      const change = prev.rank - currentRank;
      if (change > 0) return { type: "up", value: change };
      if (change < 0) return { type: "down", value: Math.abs(change) };
      return { type: "same" };
    }
    // Not in previous period -- check if truly new or returning
    const currentEntry = entries.find((e) => e.username === username);
    const allTimeEntry = allTimeEntriesMap.get(username);
    if (
      allTimeEntry &&
      currentEntry &&
      allTimeEntry.total_points > currentEntry.total_points
    ) {
      return { type: "returned" };
    }
    return { type: "new" };
  }

  function getPointsDelta(username: string): number | null {
    const prev = previousEntriesMap.get(username);
    if (!prev) return null;
    const current = entries.find((e) => e.username === username);
    if (!current) return null;
    return current.total_points - prev.total_points;
  }

  // KPI computations
  const totalActivities = useMemo(
    () => entries.reduce((sum, e) => sum + e.activity_count, 0),
    [entries],
  );
  const prevTotalActivities = useMemo(
    () => previousEntries.reduce((sum, e) => sum + e.activity_count, 0),
    [previousEntries],
  );
  const activeContributors = entries.length;
  const prevActiveContributors = previousEntries.length;

  const activitiesTrend = computeTrend(totalActivities, prevTotalActivities);
  const contributorsTrend = computeTrend(
    activeContributors,
    prevActiveContributors,
  );

  // New contributors: all-time points == current period points (no prior activity)
  const newContributorsCount = useMemo(
    () =>
      entries.filter((e) => {
        const allTime = allTimeEntriesMap.get(e.username);
        return allTime && allTime.total_points === e.total_points;
      }).length,
    [entries, allTimeEntriesMap],
  );

  const prevNewContributorsCount = useMemo(
    () =>
      previousEntries.filter((e) => {
        const allTime = allTimeEntriesMap.get(e.username);
        const currentPeriod = entries.find((c) => c.username === e.username);
        const pointsBeforePrev =
          (allTime?.total_points ?? 0) -
          (currentPeriod?.total_points ?? 0) -
          e.total_points;
        return pointsBeforePrev <= 0;
      }).length,
    [previousEntries, allTimeEntriesMap, entries],
  );

  const newContributorsTrend = computeTrend(
    newContributorsCount,
    prevNewContributorsCount,
  );

  const formattedStartDate = format(startDate, "MMM d, yyyy");
  const formattedEndDate = format(endDate, "MMM d, yyyy");

  const visibleEntries = useMemo(
    () => entries.filter((e) => !hiddenRoles.includes(e.role)),
    [entries, hiddenRoles],
  );
  const top3 = visibleEntries.slice(0, 3);
  const hasTop3 = top3.length >= 3;

  const activityDefMap = useMemo(() => {
    const map = new Map<string, ActivityDefinition>();
    activityDefinitions.forEach((def) => map.set(def.name, def));
    return map;
  }, [activityDefinitions]);

  const periodNoun = PERIOD_NOUN[period]!;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Period Tabs */}
      <div className="flex gap-2 mb-6 border-b justify-evenly sm:justify-start">
        {(["week", "month", "year"] as const).map((p) => (
          <Link
            key={p}
            href={`/leaderboard/${p}`}
            className={cn(
              "px-4 py-2 font-medium transition-colors border-b-2 capitalize",
              period === p
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </Link>
        ))}
      </div>

      {/* Date Range */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {formattedStartDate} – {formattedEndDate}
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KPICard
          label="Active Contributors"
          value={activeContributors.toString()}
          trend={contributorsTrend}
          periodLabel={PREV_PERIOD_LABELS[period]!}
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          label="Total Activities"
          value={totalActivities.toLocaleString()}
          trend={activitiesTrend}
          periodLabel={PREV_PERIOD_LABELS[period]!}
          icon={<Star className="h-4 w-4" />}
        />
        <KPICard
          label="New Contributors"
          value={newContributorsCount.toString()}
          trend={newContributorsTrend}
          periodLabel={PREV_PERIOD_LABELS[period]!}
          icon={<UserPlus className="h-4 w-4" />}
        />
      </div>

      {/* Top 3 Podium with Activity Feed */}
      {hasTop3 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-medal-gold" />
            Top Contributors
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            {/* Left activity feed */}
            <div className="hidden lg:block h-96 opacity-50">
              <PodiumActivityFeed
                activities={podiumActivities.filter((_, i) => i % 2 === 0)}
                direction="up"
              />
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-3 sm:gap-5 lg:gap-6 px-2">
              {/* 2nd place */}
              <PodiumEntry
                entry={top3[1]!}
                rank={2}
                rankChange={getRankChange(top3[1]!.username, 2)}
                pointsDelta={getPointsDelta(top3[1]!.username)}
                periodNoun={periodNoun}
              />
              {/* 1st place */}
              <PodiumEntry
                entry={top3[0]!}
                rank={1}
                rankChange={getRankChange(top3[0]!.username, 1)}
                pointsDelta={getPointsDelta(top3[0]!.username)}
                periodNoun={periodNoun}
              />
              {/* 3rd place */}
              <PodiumEntry
                entry={top3[2]!}
                rank={3}
                rankChange={getRankChange(top3[2]!.username, 3)}
                pointsDelta={getPointsDelta(top3[2]!.username)}
                periodNoun={periodNoun}
              />
            </div>

            {/* Right activity feed */}
            <div className="hidden lg:block h-96 opacity-50">
              <PodiumActivityFeed
                activities={podiumActivities.filter((_, i) => i % 2 === 1)}
                direction="down"
                align="right"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Ranked List + Activity Type Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6">
        {/* All Contributors */}
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold">
              All Contributors
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {filteredEntries.length}
                {filteredEntries.length !== entries.length &&
                  ` of ${entries.length}`}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search contributors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 w-48 sm:w-56 text-sm"
                />
              </div>
              {availableRoles.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-sm">
                      <Filter className="h-3.5 w-3.5 mr-1.5" />
                      <span className="hidden sm:inline">Role</span>
                      {selectedRoles.size !== defaultRoles.size && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-primary text-primary-foreground">
                          {selectedRoles.size}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Filter by Role</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availableRoles.map((role) => (
                          <div
                            key={role}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={role}
                              checked={selectedRoles.has(role)}
                              onCheckedChange={() => toggleRole(role)}
                            />
                            <label
                              htmlFor={role}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {roles[role]?.name ?? role}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {isFiltering && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-sm px-2"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {entries.length === 0
                  ? "No contributors with points in this period"
                  : "No contributors match the selected filters"}
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header (desktop) */}
              <div className="hidden md:grid md:grid-cols-[3.5rem_1fr_auto_6rem_8rem] gap-x-4 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>Rank</span>
                <span>Contributor</span>
                <span className="text-right">Activities</span>
                <span className="text-right">Points</span>
                <span className="text-right">Trend</span>
              </div>

              <div className="divide-y">
                {filteredEntries.map((entry) => {
                  const rank = rankMap.get(entry.username) ?? 0;
                  const isTopThree = rank <= 3;
                  const rankChange = getRankChange(entry.username, rank);
                  const pointsDelta = getPointsDelta(entry.username);

                  return (
                    <div
                      key={entry.username}
                      className={cn(
                        "group transition-colors hover:bg-muted/30",
                        isTopThree && "bg-primary/2",
                      )}
                    >
                      {/* Desktop Row */}
                      <div className="hidden md:grid md:grid-cols-[3.5rem_1fr_auto_6rem_8rem] gap-x-4 items-center px-4 py-3">
                        {/* Rank */}
                        <div className="flex items-center gap-1">
                          {isTopThree ? (
                            <Trophy
                              className={cn(
                                "h-4 w-4",
                                rank === 1
                                  ? "text-medal-gold"
                                  : rank === 2
                                    ? "text-medal-silver"
                                    : "text-medal-bronze",
                              )}
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground w-4 text-center tabular-nums">
                              {rank}
                            </span>
                          )}
                          <RankChangeBadge change={rankChange} compact />
                        </div>

                        {/* Contributor */}
                        <Link
                          href={`/${entry.username}`}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <Avatar className="size-9 shrink-0">
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
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate group-hover:underline">
                                {entry.name || entry.username}
                              </span>
                              <ContributorRoleBadge
                                role={entry.role}
                                roleName={roles[entry.role]?.name}
                                roleDescription={roles[entry.role]?.description}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              @{entry.username}
                            </span>
                          </div>
                        </Link>

                        {/* Activity Breakdown */}
                        <div className="flex items-center justify-end gap-2">
                          {activityDefinitions.map((def) => {
                            const data = entry.activity_breakdown?.[def.slug];
                            const count = data?.count ?? 0;
                            const colorClass =
                              count > 0
                                ? "text-foreground"
                                : "text-muted-foreground/30";
                            return (
                              <TooltipProvider key={def.slug}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      className={cn(
                                        "inline-flex flex-col items-center justify-center w-6 text-xs tabular-nums gap-0.5 space-y-1",
                                        colorClass,
                                      )}
                                    >
                                      <span>{count}</span>
                                      {def.icon ? (
                                        <Icon
                                          name={def.icon}
                                          className="size-3"
                                        />
                                      ) : (
                                        <Star className="size-3" />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="font-medium">{def.name}</p>
                                    {count > 0 ? (
                                      <p className="text-xs text-muted-foreground">
                                        {count}{" "}
                                        {count === 1
                                          ? "activity"
                                          : "activities"}
                                        {" \u00b7 "}
                                        {data!.points} pts
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        No activity this period
                                      </p>
                                    )}
                                    {def.description && (
                                      <p className="text-xs text-muted-foreground/70 mt-1 max-w-48">
                                        {def.description}
                                      </p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {entry.total_points}
                          </span>
                          {pointsDelta !== null && pointsDelta !== 0 && (
                            <div className="mt-0.5">
                              <PointsDeltaBadge
                                delta={pointsDelta}
                                periodNoun={periodNoun}
                                compact
                              />
                            </div>
                          )}
                        </div>

                        {/* Sparkline */}
                        <div className="flex justify-end">
                          {entry.daily_activity &&
                          entry.daily_activity.length > 0 ? (
                            <ActivityTrendChart
                              dailyActivity={entry.daily_activity}
                              startDate={startDate}
                              endDate={endDate}
                              mode="points"
                            />
                          ) : (
                            <div className="w-[120px]" />
                          )}
                        </div>
                      </div>

                      {/* Mobile Row */}
                      <Link
                        href={`/${entry.username}`}
                        className="flex md:hidden items-center gap-3 px-4 py-3"
                      >
                        <div className="flex items-center justify-center w-8 shrink-0">
                          {isTopThree ? (
                            <Trophy
                              className={cn(
                                "h-4 w-4",
                                rank === 1
                                  ? "text-medal-gold"
                                  : rank === 2
                                    ? "text-medal-silver"
                                    : "text-medal-bronze",
                              )}
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground tabular-nums">
                              {rank}
                            </span>
                          )}
                        </div>
                        <Avatar className="size-9 shrink-0">
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">
                              {entry.name || entry.username}
                            </span>
                            <RankChangeBadge change={rankChange} compact />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {activityDefinitions.map((def) => {
                              const count =
                                entry.activity_breakdown?.[def.slug]?.count ??
                                0;
                              if (count === 0) return null;
                              return (
                                <span
                                  key={def.slug}
                                  className="inline-flex items-center gap-0.5"
                                >
                                  {def.icon ? (
                                    <Icon name={def.icon} className="size-3" />
                                  ) : (
                                    <Star className="size-3" />
                                  )}
                                  {count}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-primary tabular-nums">
                            {entry.total_points}
                          </div>
                          {pointsDelta !== null && pointsDelta !== 0 && (
                            <PointsDeltaBadge
                              delta={pointsDelta}
                              periodNoun={periodNoun}
                              compact
                            />
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Activity Type Leaders Sidebar */}
        {Object.keys(filteredTopByActivity).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Top by Activity Type
            </h2>
            {Object.entries(filteredTopByActivity).map(
              ([activityName, contributors]) => {
                const def = activityDefMap.get(activityName);
                const top3Activity = contributors.slice(0, 3);
                const leader = top3Activity[0];
                if (!leader) return null;

                return (
                  <Card key={activityName} className="overflow-hidden">
                    <CardContent>
                      <div className="flex items-center gap-2 mb-5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {def?.icon ? (
                            <Icon
                              name={def.icon}
                              className="h-4 w-4 text-primary"
                            />
                          ) : (
                            <Trophy className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {activityName}
                          </h3>
                          {def?.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {def.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {top3Activity.map((contributor, idx) => (
                          <Link
                            key={contributor.username}
                            href={`/${contributor.username}`}
                            className="flex items-center gap-2 group"
                          >
                            <span
                              className={cn(
                                "text-xs font-bold w-6 text-center shrink-0",
                                idx === 0
                                  ? "text-medal-gold"
                                  : idx === 1
                                    ? "text-medal-silver"
                                    : idx === 2
                                      ? "text-medal-bronze"
                                      : "text-muted-foreground",
                              )}
                            >
                              {idx + 1}
                            </span>
                            <Avatar className="size-6 shrink-0">
                              <AvatarImage
                                src={contributor.avatar_url || undefined}
                                alt={contributor.name || contributor.username}
                              />
                              <AvatarFallback className="text-[8px]">
                                {(contributor.name || contributor.username)
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate flex-1 group-hover:underline">
                              {contributor.name || contributor.username}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                              {contributor.count}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumEntry({
  entry,
  rank,
  rankChange,
  pointsDelta,
  periodNoun,
}: {
  entry: LeaderboardEntry;
  rank: number;
  rankChange: RankChange;
  pointsDelta: number | null;
  periodNoun: string;
}) {
  const isFirst = rank === 1;

  const medalColor =
    rank === 1
      ? "text-medal-gold"
      : rank === 2
        ? "text-medal-silver"
        : "text-medal-bronze";

  const pedestalBg =
    rank === 1
      ? "bg-medal-gold/10 border-medal-gold/30"
      : rank === 2
        ? "bg-medal-silver/10 border-medal-silver/30"
        : "bg-medal-bronze/10 border-medal-bronze/30";

  const glowColor =
    rank === 1
      ? "shadow-medal-gold/20"
      : rank === 2
        ? "shadow-medal-silver/20"
        : "shadow-medal-bronze/20";

  const pedestalHeight = rank === 1 ? "h-40" : rank === 2 ? "h-28" : "h-20";
  const avatarSize = isFirst ? "size-20 sm:size-24" : "size-14 sm:size-16";
  const animDelay = rank === 1 ? "0s" : rank === 2 ? "0.15s" : "0.3s";
  const floatDuration = rank === 1 ? "3s" : rank === 2 ? "3.5s" : "4s";
  const floatDelay = rank === 1 ? "0.6s" : rank === 2 ? "0.75s" : "0.9s";

  return (
    <div
      className={cn(
        "animate-[podiumRise_0.6s_ease-out_both]",
        isFirst ? "w-36 sm:w-44 lg:w-52" : "w-28 sm:w-36 lg:w-44",
      )}
      style={{ animationDelay: animDelay }}
    >
      <Link
        href={`/${entry.username}`}
        className="flex flex-col items-center group no-underline animate-[podiumFloat_ease-in-out_infinite_both]"
        style={{
          animationDuration: floatDuration,
          animationDelay: floatDelay,
        }}
      >
        {/* Avatar with medal ring + glow */}
        <div className="relative mb-3">
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-40 animate-[pulse_3s_ease-in-out_infinite]",
              rank === 1
                ? "bg-medal-gold"
                : rank === 2
                  ? "bg-medal-silver"
                  : "bg-medal-bronze",
            )}
            style={{ animationDelay: animDelay }}
          />
          <Avatar
            className={cn(
              avatarSize,
              "ring-3 shadow-lg relative transition-transform duration-300 group-hover:scale-105",
              rank === 1
                ? "ring-medal-gold"
                : rank === 2
                  ? "ring-medal-silver"
                  : "ring-medal-bronze",
              glowColor,
            )}
          >
            <AvatarImage
              src={entry.avatar_url || undefined}
              alt={entry.name || entry.username}
            />
            <AvatarFallback className={isFirst ? "text-xl" : "text-sm"}>
              {(entry.name || entry.username).substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Medal badge */}
          <div
            className={cn(
              "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-background border-2 flex items-center justify-center",
              isFirst ? "size-7" : "size-6",
              rank === 1
                ? "border-medal-gold"
                : rank === 2
                  ? "border-medal-silver"
                  : "border-medal-bronze",
            )}
          >
            <Trophy
              className={cn(isFirst ? "h-4 w-4" : "h-3 w-3", medalColor)}
            />
          </div>
        </div>

        {/* Name + username */}
        <div className="text-center mb-1 w-full px-1">
          <p
            className={cn(
              "font-semibold truncate group-hover:underline",
              isFirst ? "text-base sm:text-lg" : "text-sm",
            )}
          >
            {entry.name || entry.username}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            @{entry.username}
          </p>
        </div>

        {/* Pedestal */}
        <div
          className={cn(
            "w-full rounded-t-xl border-x border-t flex flex-col items-center justify-center gap-1.5 py-3 mt-2 transition-shadow duration-300 group-hover:shadow-lg",
            pedestalHeight,
            pedestalBg,
          )}
        >
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "font-bold text-primary tabular-nums",
                isFirst ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              )}
            >
              {entry.total_points}
            </span>
            <span className="text-[10px] text-muted-foreground">pts</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {pointsDelta !== null && pointsDelta !== 0 && (
              <PointsDeltaBadge
                delta={pointsDelta}
                periodNoun={periodNoun}
                compact
              />
            )}
            <RankChangeBadge change={rankChange} compact />
          </div>
        </div>
      </Link>
    </div>
  );
}

function PodiumActivityFeed({
  activities,
  direction,
  align = "left",
}: {
  activities: PodiumActivity[];
  direction: "up" | "down";
  align?: "left" | "right";
}) {
  if (activities.length === 0) return null;

  const animName =
    direction === "up"
      ? "animate-[marqueeScrollUp_60s_linear_infinite]"
      : "animate-[marqueeScrollDown_60s_linear_infinite]";

  const isRight = align === "right";
  const items = activities.slice(0, 50);

  const renderItem = (activity: PodiumActivity, idx: number) => (
    <div
      key={`${activity.slug}-${idx}`}
      className={cn(
        "flex items-start gap-2 px-3 py-2 text-xs",
        isRight && "flex-row-reverse",
      )}
    >
      <Avatar className="size-5 shrink-0 mt-0.5">
        <AvatarImage
          src={activity.contributor_avatar_url || undefined}
          alt={activity.contributor_name || activity.contributor}
        />
        <AvatarFallback className="text-[8px]">
          {(activity.contributor_name || activity.contributor)
            .substring(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={cn("min-w-0 flex-1", isRight && "text-right")}>
        <div
          className={cn(
            "flex items-center gap-1.5 mb-0.5",
            isRight && "flex-row-reverse",
          )}
        >
          {activity.activity_icon && (
            <Icon
              name={activity.activity_icon}
              className="size-3 text-muted-foreground shrink-0"
            />
          )}
          <span className="font-medium text-muted-foreground truncate">
            {activity.activity_name}
          </span>
          {activity.points !== null && activity.points > 0 && (
            <span className="text-[10px] text-primary shrink-0">
              +{activity.points}
            </span>
          )}
        </div>
        {activity.title && (
          <p className="text-muted-foreground/70 truncate leading-tight">
            {activity.title}
          </p>
        )}
        <span className="text-[10px] text-muted-foreground/50">
          {activity.contributor_name || activity.contributor}
          {" \u00b7 "}
          {formatDistanceToNow(new Date(activity.occured_at), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="relative overflow-hidden h-full"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div className={cn("flex flex-col", animName)}>
        {items.map((a, i) => renderItem(a, i))}
        {items.map((a, i) => renderItem(a, i + items.length))}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  trend,
  periodLabel,
  icon,
}: {
  label: string;
  value: string;
  trend: { percentage: number; direction: "up" | "down" | "flat" } | null;
  periodLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-muted-foreground/60">{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {trend && trend.direction !== "flat" ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                trend.direction === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.percentage}%
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RankChangeBadge({
  change,
  compact,
  className,
}: {
  change: RankChange;
  compact?: boolean;
  className?: string;
}) {
  if (change.type === "same") {
    if (compact) return null;
    return (
      <span className={cn("text-xs text-muted-foreground pl-3", className)}>
        <Minus className="h-3 w-3 inline" />
      </span>
    );
  }

  if (change.type === "new") {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 pl-1.5",
                className,
              )}
            >
              NEW
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            First time on the leaderboard
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (change.type === "returned") {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center text-xs font-medium text-muted-foreground pl-1",
                className,
              )}
            >
              BACK
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Returning after a period of inactivity
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (change.type === "up") {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 pl-3",
                className,
              )}
            >
              <ChevronUp className="h-3 w-3" />
              {!compact && change.value}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Up {change.value} {change.value === 1 ? "position" : "positions"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400 pl-3",
              className,
            )}
          >
            <ChevronDown className="h-3 w-3" />
            {!compact && change.value}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Down {change.value} {change.value === 1 ? "position" : "positions"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PointsDeltaBadge({
  delta,
  periodNoun,
  compact,
}: {
  delta: number;
  periodNoun: string;
  compact?: boolean;
}) {
  const isPositive = delta > 0;
  const tooltipText = isPositive
    ? `Earned ${Math.abs(delta)} more points than ${periodNoun}`
    : `Earned ${Math.abs(delta)} fewer points than ${periodNoun}`;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {compact ? Math.abs(delta) : `${isPositive ? "+" : ""}${delta} pts`}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
