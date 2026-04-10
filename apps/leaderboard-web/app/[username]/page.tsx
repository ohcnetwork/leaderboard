import { icons } from "@/app/icons.gen";
import { ContributorRoleBadge } from "@/components/ContributorRoleBadge";
import Icon from "@/components/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfig } from "@/lib/config/get-config";
import {
  getAllBadgeDefinitions,
  getAllContributorUsernames,
  getContributorAggregates,
  getContributorBadges,
  getContributorProfile,
  listActivityDefinitions,
} from "@/lib/data/loader";
import { getContributorProfileEditUrl } from "@/lib/github-edit-url";
import { formatAggregateValue } from "@/lib/utils";
import {
  Activity as ActivityIcon,
  Award,
  Calendar,
  Github,
  Link as LinkIcon,
  LucideIcon,
  TrendingUp,
} from "lucide-react";
import { marked } from "marked";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActivityBreakdown from "./ActivityBreakdown";
import ActivityOverview from "./ActivityOverview";
import ActivityTimeline from "./ActivityTimeline";
import BadgeShowcase from "./BadgeShowcase";

// Built-in aggregate definitions for profile page
const BUILTIN_CONTRIBUTOR_AGGREGATES = {
  total_points: {
    name: "Total Points",
    description: "All time",
    icon: Award,
  },
  total_activities: {
    name: "Total Activities",
    description: "All time",
    icon: ActivityIcon,
  },
  activity_types: {
    name: "Activity Types",
    description: "Different types",
    icon: Calendar,
  },
};

interface ContributorPageProps {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username) => ({ username }));
}

export async function generateMetadata({
  params,
}: ContributorPageProps): Promise<Metadata> {
  const { username } = await params;
  const { contributor, totalPoints, activities } =
    await getContributorProfile(username);
  const config = getConfig();

  if (!contributor) {
    return {
      title: "Contributor Not Found",
    };
  }

  const title = `${contributor.name || contributor.username} - ${
    config.org.name
  } Contributor`;
  const description =
    contributor.bio ||
    `${
      contributor.name || contributor.username
    } has earned ${totalPoints} points from ${
      activities.length
    } activities on ${
      config.org.name
    }. View their complete contribution history and activity breakdown.`;

  const profileUrl = `things-equal-take-tend.trycloudflare.com/${username}`;

  return {
    title,
    description,
    keywords: [
      contributor.name || contributor.username,
      username,
      config.org.name,
      "contributor",
      "leaderboard",
      "open source",
      "contributions",
      contributor.role,
    ].filter((k): k is string => Boolean(k)),
    authors: [
      {
        name: contributor.name || contributor.username,
        url: contributor.avatar_url || undefined,
      },
    ],
    creator: contributor.name || contributor.username,
    openGraph: {
      title,
      description,
      url: profileUrl,
      siteName: config.meta.title,
      type: "profile",
      images: [
        {
          url: `${profileUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${contributor.name || contributor.username}'s profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${profileUrl}/opengraph-image`],
      creator: contributor.avatar_url?.includes("twitter.com")
        ? `@${contributor.username}`
        : undefined,
    },
    alternates: {
      canonical: profileUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ContributorPage({
  params,
}: ContributorPageProps) {
  const { username } = await params;
  const config = getConfig();

  // Get configured aggregates or use defaults
  const configuredAggregates = config.leaderboard.aggregates?.contributor || [
    "total_points",
    "total_activities",
    "activity_types",
  ];

  // Separate built-in and database aggregates
  const builtinSlugs = configuredAggregates.filter(
    (slug) => slug in BUILTIN_CONTRIBUTOR_AGGREGATES,
  );
  const dbAggregatesSlugs = configuredAggregates.filter(
    (slug) => !(slug in BUILTIN_CONTRIBUTOR_AGGREGATES),
  );

  const [
    { contributor, activities, totalPoints },
    activityDefinitions,
    dbAggregates,
    badges,
    badgeDefinitions,
  ] = await Promise.all([
    getContributorProfile(username),
    listActivityDefinitions(),
    getContributorAggregates(username, dbAggregatesSlugs),
    getContributorBadges(username),
    getAllBadgeDefinitions(),
  ]);

  if (!contributor) {
    notFound();
  }

  const profileEditUrl =
    config.leaderboard.data_source != null &&
    config.leaderboard.data_source.length > 0
      ? getContributorProfileEditUrl(
          config.leaderboard.data_source,
          config.leaderboard.data_branch,
          contributor.username,
        )
      : null;

  // Convert bio markdown to HTML
  const bioHtml = contributor.bio ? await marked.parse(contributor.bio) : null;

  // Calculate stats
  const activityBreakdown = activities.reduce(
    (acc, activity) => {
      const key = activity.activity_name;
      if (!acc[key]) {
        acc[key] = { count: 0, points: 0 };
      }
      acc[key].count += 1;
      acc[key].points += activity.points || 0;
      return acc;
    },
    {} as Record<string, { count: number; points: number }>,
  );

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
      BUILTIN_CONTRIBUTOR_AGGREGATES[
        slug as keyof typeof BUILTIN_CONTRIBUTOR_AGGREGATES
      ];
    let value = "0";

    if (slug === "total_points") {
      value = totalPoints.toString();
    } else if (slug === "total_activities") {
      value = activities.length.toString();
    } else if (slug === "activity_types") {
      value = Object.keys(activityBreakdown).length.toString();
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
    aggregateCards.push({
      name: aggregate.aggregate,
      value: formatAggregateValue(aggregate.value),
      description: "",
      icon: TrendingUp, // Default icon for DB aggregates
    });
  }

  // Prepare activities data for ActivityBreakdown component
  const activitiesForBreakdown = activities.map((activity) => ({
    activity_definition_name: activity.activity_name,
    occurred_at: activity.occurred_at,
    points: activity.points || 0,
  }));

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: contributor.name || contributor.username,
      alternateName: contributor.username,
      image: contributor.avatar_url,
      description: contributor.bio,
      url: contributor.avatar_url,
      memberOf: {
        "@type": "Organization",
        name: config.org.name,
        url: config.org.url,
      },
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CreateAction",
          userInteractionCount: activities.length,
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4 sm:py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="size-20 sm:size-32 shrink-0">
              <AvatarImage
                src={contributor.avatar_url || undefined}
                alt={contributor.name || contributor.username}
              />
              <AvatarFallback className="text-2xl sm:text-4xl">
                {(contributor.name || contributor.username)
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 wrap-break-word">
                {contributor.name || contributor.username}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-4 truncate">
                @{contributor.username}
              </p>

              {bioHtml && (
                <div
                  className="text-muted-foreground mb-4 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: bioHtml }}
                />
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {profileEditUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={profileEditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      Edit profile on GitHub
                    </a>
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <ContributorRoleBadge
                    role={contributor.role}
                    roleName={config.leaderboard.roles[contributor.role]?.name}
                    roleDescription={
                      config.leaderboard.roles[contributor.role]?.description
                    }
                  />
                </div>
                {contributor.social_profiles && (
                  <div className="flex items-center gap-3">
                    {Object.entries(contributor.social_profiles).map(
                      ([key, url]) => {
                        const socialProfileDef =
                          config.leaderboard.social_profiles?.[key];
                        const iconName = socialProfileDef?.icon;

                        // Type guard to check if icon is a valid string key
                        const isValidIconKey = (
                          name: unknown,
                        ): name is keyof typeof icons => {
                          return (
                            typeof name === "string" &&
                            Object.prototype.hasOwnProperty.call(icons, name)
                          );
                        };

                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title={key}
                          >
                            {isValidIconKey(iconName) ? (
                              <Icon name={iconName} className="h-5 w-5" />
                            ) : (
                              <LinkIcon className="h-5 w-5" />
                            )}
                          </a>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
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

        {/* Activity Overview */}
        <ActivityOverview
          activities={activities.map((a) => ({
            activity_definition_name: a.activity_name,
            occurred_at: a.occurred_at,
          }))}
          activityDefinitions={activityDefinitions}
        />

        {/* Badges Section */}
        {badges.length > 0 && (
          <div className="mb-8 md:hidden">
            <BadgeShowcase
              badges={badges}
              badgeDefinitions={badgeDefinitions}
            />
          </div>
        )}

        {/* Activity Breakdown */}
        <ActivityBreakdown activities={activitiesForBreakdown} />

        {/* Activity Timeline + Achievements sidebar */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <ActivityTimeline
              activities={activities}
              activityDefinitions={activityDefinitions}
            />
          </div>

          {badges.length > 0 && (
            <aside className="hidden md:block w-100 shrink-0">
              <BadgeShowcase
                badges={badges}
                badgeDefinitions={badgeDefinitions}
              />
            </aside>
          )}
        </div>

        {/* Back to Leaderboard */}
        <div className="mt-8 text-center">
          <Link
            href="/leaderboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    </>
  );
}
