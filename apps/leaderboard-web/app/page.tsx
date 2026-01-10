import {
  getRecentActivitiesGroupedByType,
  getGlobalAggregates,
} from "@/lib/data/loader";
import { getConfig } from "@/lib/config/get-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import RelativeTime from "@/components/RelativeTime";
import Link from "next/link";
import { Activity, Users, TrendingUp, LucideIcon } from "lucide-react";
import { formatAggregateValue } from "@/lib/utils";

// Built-in aggregate definitions for home page
const BUILTIN_GLOBAL_AGGREGATES = {
  total_activities: {
    name: "Total Activities",
    description: "Last 7 days",
    icon: Activity,
  },
  count_contributors: {
    name: "Active Contributors",
    description: "Last 7 days",
    icon: Users,
  },
  activity_types: {
    name: "Activity Types",
    description: "Different types",
    icon: TrendingUp,
  },
};

export default async function Home() {
  const config = getConfig();
  const activityGroups = await getRecentActivitiesGroupedByType(7);

  // Calculate built-in stats
  const totalActivities = activityGroups.reduce(
    (sum, group) => sum + group.activities.length,
    0
  );
  const uniqueContributors = new Set(
    activityGroups.flatMap((group) =>
      group.activities.map((a) => a.contributor)
    )
  ).size;
  const totalActivityTypes = activityGroups.length;

  // Get configured aggregates or use defaults
  const configuredAggregates = config.leaderboard.aggregates?.global || [
    "total_activities",
    "count_contributors",
    "activity_types",
  ];

  // Separate built-in and database aggregates
  const builtinSlugs = configuredAggregates.filter(
    (slug) => slug in BUILTIN_GLOBAL_AGGREGATES
  );
  const dbAggregatesSlugs = configuredAggregates.filter(
    (slug) => !(slug in BUILTIN_GLOBAL_AGGREGATES)
  );

  // Fetch database aggregates
  const dbAggregates = await getGlobalAggregates(dbAggregatesSlugs);

  // Build aggregate cards data
  interface AggregateCard {
    name: string;
    value: string;
    description: string;
    icon: LucideIcon;
  }

  const aggregateCards: AggregateCard[] = [];

  // Add built-in aggregates
  for (const slug of builtinSlugs) {
    const def =
      BUILTIN_GLOBAL_AGGREGATES[slug as keyof typeof BUILTIN_GLOBAL_AGGREGATES];
    let value = "0";

    if (slug === "total_activities") {
      value = totalActivities.toString();
    } else if (slug === "count_contributors") {
      value = uniqueContributors.toString();
    } else if (slug === "activity_types") {
      value = totalActivityTypes.toString();
    }

    aggregateCards.push({
      name: def.name,
      value,
      description: def.description,
      icon: def.icon,
    });
  }

  // Add database aggregates
  for (const aggregate of dbAggregates) {
    if (aggregate.value) {
      aggregateCards.push({
        name: aggregate.name,
        value: formatAggregateValue(aggregate.value),
        description: aggregate.description || "",
        icon: TrendingUp, // Default icon for DB aggregates
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{config.org.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {config.org.description}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {aggregateCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.description && (
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Feed Grouped by Type */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Activities</h2>
          <Link
            href="/leaderboard"
            className="text-sm text-primary hover:underline"
          >
            View Leaderboard →
          </Link>
        </div>

        {activityGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No activities in the last 7 days
            </CardContent>
          </Card>
        ) : (
          activityGroups.map((group) => (
            <Card key={group.activity_definition}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {group.activity_name}
                    </CardTitle>
                    {group.activity_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.activity_description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {group.activities.length}{" "}
                    {group.activities.length === 1 ? "activity" : "activities"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.activities.slice(0, 10).map((activity) => (
                    <div
                      key={activity.slug}
                      className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={activity.contributor_avatar_url || undefined}
                          alt={
                            activity.contributor_name || activity.contributor
                          }
                        />
                        <AvatarFallback>
                          {(activity.contributor_name || activity.contributor)
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/${activity.contributor}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {activity.contributor_name || activity.contributor}
                          </Link>
                          {activity.contributor_role && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {activity.contributor_role}
                            </span>
                          )}
                          <RelativeTime
                            date={activity.occured_at}
                            className="text-sm text-muted-foreground"
                          />
                        </div>
                        {activity.title && (
                          <p className="text-sm mt-1 truncate">
                            {activity.link ? (
                              <a
                                href={activity.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline"
                              >
                                {activity.title}
                              </a>
                            ) : (
                              activity.title
                            )}
                          </p>
                        )}
                        {activity.text && (
                          <div
                            className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: activity.text }}
                          />
                        )}
                      </div>
                      {activity.points !== null && activity.points > 0 && (
                        <div className="text-sm font-medium text-primary">
                          +{activity.points}
                        </div>
                      )}
                    </div>
                  ))}
                  {group.activities.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      And {group.activities.length - 10} more...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
