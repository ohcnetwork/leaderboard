import {
  getAllContributorUsernames,
  getContributorProfile,
  listActivityDefinitions,
  getContributorAggregates,
  getContributorBadges,
} from "@/lib/data/loader";
import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateActivityGraphData, formatAggregateValue } from "@/lib/utils";
import { getConfig } from "@/lib/config/get-config";
import ActivityOverview from "./ActivityOverview";
import ActivityBreakdown from "./ActivityBreakdown";
import ActivityTimeline from "./ActivityTimeline";
import Link from "next/link";
import {
  Calendar,
  Award,
  Activity as ActivityIcon,
  Link as LinkIcon,
  LucideIcon,
  TrendingUp,
} from "lucide-react";
import Icon from "@/components/Icon";
import { icons } from "@/app/icons.gen";
import { marked } from "marked";
import { Metadata } from "next";

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
  const { contributor, totalPoints, activities } = await getContributorProfile(
    username
  );
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
    (slug) => slug in BUILTIN_CONTRIBUTOR_AGGREGATES
  );
  const dbAggregatesSlugs = configuredAggregates.filter(
    (slug) => !(slug in BUILTIN_CONTRIBUTOR_AGGREGATES)
  );

  const [
    { contributor, activities, totalPoints, activityByDate },
    activityDefinitions,
    dbAggregates,
    badges,
  ] = await Promise.all([
    getContributorProfile(username),
    listActivityDefinitions(),
    getContributorAggregates(username, dbAggregatesSlugs),
    getContributorBadges(username),
  ]);

  if (!contributor) {
    notFound();
  }

  const activityGraphData = generateActivityGraphData(activityByDate, 365);

  // Convert bio markdown to HTML
  const bioHtml = contributor.bio ? await marked.parse(contributor.bio) : null;

  // Calculate stats
  const activityBreakdown = activities.reduce((acc, activity) => {
    const key = activity.activity_name;
    if (!acc[key]) {
      acc[key] = { count: 0, points: 0 };
    }
    acc[key].count += 1;
    acc[key].points += activity.points || 0;
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

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
    occured_at: activity.occured_at,
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

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={contributor.avatar_url || undefined}
                alt={contributor.name || contributor.username}
              />
              <AvatarFallback className="text-4xl">
                {(contributor.name || contributor.username)
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {contributor.name || contributor.username}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                @{contributor.username}
              </p>

              {bioHtml && (
                <div
                  className="text-muted-foreground mb-4 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: bioHtml }}
                />
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {contributor.role && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {contributor.role}
                    </span>
                  </div>
                )}
                {contributor.social_profiles && (
                  <div className="flex items-center gap-3">
                    {Object.entries(contributor.social_profiles).map(
                      ([key, url]) => {
                        const socialProfileDef =
                          config.leaderboard.social_profiles?.[key];
                        const iconName = socialProfileDef?.icon;

                        // Type guard to check if icon is a valid string key
                        const isValidIconKey = (
                          name: unknown
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
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={key}
                          >
                            {isValidIconKey(iconName) ? (
                              <Icon name={iconName} className="h-5 w-5" />
                            ) : (
                              <LinkIcon className="h-5 w-5" />
                            )}
                          </a>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          data={activityGraphData}
          activities={activities.map((a) => ({
            activity_definition_name: a.activity_name,
            occured_at: a.occured_at,
          }))}
          activityDefinitions={activityDefinitions}
          totalActivities={activities.length}
        />

        {/* Badges Section */}
        {badges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.slug}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer relative group"
                      title={`${badge.badge} - ${badge.variant}`}
                    >
                      {badge.variant !== "bronze" && (
                        <span className="absolute -bottom-1 -right-1 bg-white text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-amber-600 capitalize">
                          {badge.variant.charAt(0)}
                        </span>
                      )}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        <div className="font-bold">{badge.badge}</div>
                        <div className="text-gray-300 mt-1 capitalize">
                          {badge.variant}
                        </div>
                        <div className="text-gray-400 mt-1 text-xs">
                          Earned: {new Date(badge.achieved_on).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Breakdown */}
        <ActivityBreakdown activities={activitiesForBreakdown} />

        {/* Activity Timeline */}
        <ActivityTimeline
          activities={activities}
          activityDefinitions={activityDefinitions}
        />

        {/* Back to Leaderboard */}
        <div className="mt-8 text-center">
          <Link
            href="/leaderboard"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    </>
  );
}
