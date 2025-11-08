import { getDb } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { getLeaderboard } from "@/lib/leaderboard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { TimeFilter } from "@/components/TimeFilter";
import type { TimeFilter as TimeFilterType } from "@/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    filter?: string[];
  }>;
}

export async function generateStaticParams() {
  return [
    { filter: [] }, // /leaderboard
    { filter: ["all-time"] },
    { filter: ["weekly"] },
    { filter: ["monthly"] },
    { filter: ["yearly"] },
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const config = getConfig();
  const { filter } = await params;
  const filterType = filter?.[0] || "all-time";

  const filterLabels: Record<string, string> = {
    "all-time": "All Time",
    weekly: "This Week",
    monthly: "This Month",
    yearly: "This Year",
  };

  const title = `${filterLabels[filterType] || "All Time"} Leaderboard - ${
    config.meta.title
  }`;
  const description = `View the ${
    filterLabels[filterType]?.toLowerCase() || "all time"
  } leaderboard for ${config.org.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${config.meta.site_url}/leaderboard/${filterType}`,
      siteName: config.org.name,
      images: [
        {
          url: config.meta.image_url,
          alt: config.org.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [config.meta.image_url],
    },
  };
}

export default async function LeaderboardPage({ params }: PageProps) {
  const config = getConfig();
  const db = getDb();
  const { filter } = await params;
  const filterType = filter?.[0] || "all-time";

  // Map URL filter to TimeFilter type
  const timeFilter: TimeFilterType = (() => {
    switch (filterType) {
      case "weekly":
        return { type: "weekly", weeks: 1 };
      case "monthly":
        return { type: "monthly", months: 1 };
      case "yearly":
        return { type: "yearly", years: 1 };
      case "all-time":
      default:
        return { type: "all-time" };
    }
  })();

  const leaderboard = await getLeaderboard(db, timeFilter);

  const filterLabels: Record<string, string> = {
    "all-time": "All Time",
    weekly: "This Week",
    monthly: "This Month",
    yearly: "This Year",
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            {config.org.name} contributor rankings
          </p>
        </div>

        <TimeFilter currentFilter={filterType} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {filterLabels[filterType] || "All Time"} Rankings
          </h2>
          <p className="text-sm text-muted-foreground">
            {leaderboard.length} contributors
          </p>
        </div>

        {leaderboard.length > 0 ? (
          <LeaderboardTable entries={leaderboard} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No activities found for this time period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
