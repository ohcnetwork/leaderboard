import Link from "next/link";
import { getDb } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { getTopContributors } from "@/lib/leaderboard";
import { getEnrichedActivities } from "@/lib/db";
import { ContributorCard } from "@/components/ContributorCard";
import { ActivityItem } from "@/components/ActivityItem";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Activity, Trophy, TrendingUp } from "lucide-react";

export default async function Home() {
  const config = getConfig();
  const db = getDb();

  // Fetch top 10 contributors
  const topContributors = await getTopContributors(db, 10);

  // Fetch recent activities
  const recentActivities = await getEnrichedActivities(db, { limit: 20 });

  // Calculate stats
  const totalContributors = topContributors.length;
  const totalActivities = recentActivities.length;
  const totalPoints = topContributors.reduce(
    (sum, entry) => sum + entry.total_points,
    0
  );

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {config.org.name} Leaderboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {config.org.description}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/leaderboard">
            <Button size="lg">
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </Link>
          <Link href="/people">
            <Button size="lg" variant="outline">
              <Users className="mr-2 h-5 w-5" />
              Browse Contributors
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Contributors"
          value={totalContributors}
          icon={Users}
          description="Active members contributing"
        />
        <StatCard
          title="Recent Activities"
          value={totalActivities}
          icon={Activity}
          description="Latest contributions tracked"
        />
        <StatCard
          title="Total Points"
          value={totalPoints}
          icon={TrendingUp}
          description="Accumulated by top contributors"
        />
      </section>

      {/* Top Contributors Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Top Contributors
            </h2>
            <p className="text-muted-foreground">
              Leading the way in our community
            </p>
          </div>
          <Link href="/leaderboard">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topContributors.slice(0, 6).map((entry) => (
            <ContributorCard
              key={entry.contributor.username}
              contributor={entry.contributor}
              totalPoints={entry.total_points}
              activityCount={entry.activity_count}
              rank={entry.rank}
            />
          ))}
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Recent Activity
            </h2>
            <p className="text-muted-foreground">
              Latest contributions from our community
            </p>
          </div>
          <Link href="/feed">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivities.slice(0, 10).map((activity) => (
            <ActivityItem key={activity.slug} activity={activity} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>About This Leaderboard</CardTitle>
            <CardDescription>
              How we track and celebrate contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This leaderboard tracks contributions across various activities in
              the {config.org.name} community. Points are awarded based on the
              type and impact of each contribution, encouraging active
              participation and collaboration.
            </p>
            <div className="flex gap-4">
              {config.org.url && (
                <a
                  href={config.org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">Learn More</Button>
                </a>
              )}
              {config.org.socials?.github && (
                <a
                  href={config.org.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">GitHub</Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
