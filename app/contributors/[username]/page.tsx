import { getDb, getAllContributors } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { getContributorStats } from "@/lib/leaderboard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem } from "@/components/ActivityItem";
import { Mail, ExternalLink, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateStaticParams() {
  const db = getDb();
  const contributors = await getAllContributors(db);

  return contributors.map((contributor) => ({
    username: contributor.username,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = getConfig();
  const db = getDb();
  const { username } = await params;

  const stats = await getContributorStats(db, username);

  if (!stats) {
    return {
      title: "Contributor Not Found",
    };
  }

  const contributor = stats.contributor;
  const title = `${contributor.name || contributor.username} - ${config.meta.title}`;
  const description = contributor.bio || `View ${contributor.name || contributor.username}'s contributions to ${config.org.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${config.meta.site_url}/contributors/${username}`,
      siteName: config.org.name,
      images: [
        {
          url: contributor.avatar_url || config.meta.image_url,
          alt: contributor.name || contributor.username,
        },
      ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [contributor.avatar_url || config.meta.image_url],
    },
  };
}

export default async function ContributorPage({ params }: PageProps) {
  const config = getConfig();
  const db = getDb();
  const { username } = await params;

  const stats = await getContributorStats(db, username);

  if (!stats) {
    notFound();
  }

  const contributor = stats.contributor;
  const initials = contributor.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || contributor.username.slice(0, 2).toUpperCase();

  const topActivities = stats.activity_breakdown
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5);

  return (
    <div className="container py-8 space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              {contributor.avatar_url && (
                <AvatarImage
                  src={contributor.avatar_url}
                  alt={contributor.name || contributor.username}
                />
              )}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold">
                  {contributor.name || contributor.username}
                </h1>
                <p className="text-muted-foreground">@{contributor.username}</p>
              </div>

              {contributor.bio && (
                <p className="text-muted-foreground">{contributor.bio}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {contributor.role && (
                  <Badge variant="secondary">{contributor.role}</Badge>
                )}
                {contributor.email && (
                  <a
                    href={`mailto:${contributor.email}`}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {contributor.email}
                  </a>
                )}
                {contributor.profile_url && (
                  <a
                    href={contributor.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_points}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activity_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All-Time Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              #{stats.ranks.all_time}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              #{stats.ranks.monthly || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topActivities.map((activity) => (
              <div
                key={activity.activity_definition}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium">{activity.activity_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.count} {activity.count === 1 ? "time" : "times"}
                  </div>
                </div>
                <Badge variant="secondary">{activity.total_points} pts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Activity</h2>
        <div className="space-y-3">
          {stats.recent_activities.length > 0 ? (
            stats.recent_activities.map((activity) => (
              <ActivityItem
                key={activity.slug}
                activity={{
                  ...activity,
                  contributor_info: contributor,
                  activity_definition_info: {
                    slug: activity.activity_definition,
                    name: stats.activity_breakdown.find(
                      (a) => a.activity_definition === activity.activity_definition
                    )?.activity_name || activity.activity_definition,
                    description: null,
                    points: activity.points,
                  },
                  calculated_points: activity.points || 0,
                }}
                showContributor={false}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No recent activities</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

