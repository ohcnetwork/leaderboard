import { getDb } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { getEnrichedActivities } from "@/lib/db";
import { ActivityItem } from "@/components/ActivityItem";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();

  return {
    title: `Activity Feed - ${config.meta.title}`,
    description: `View all recent activities from ${config.org.name} contributors`,
    openGraph: {
      title: `Activity Feed - ${config.meta.title}`,
      description: `View all recent activities from ${config.org.name} contributors`,
      url: `${config.meta.site_url}/feed`,
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
      title: `Activity Feed - ${config.meta.title}`,
      description: `View all recent activities from ${config.org.name} contributors`,
      images: [config.meta.image_url],
    },
  };
}

export default async function FeedPage() {
  const config = getConfig();
  const db = getDb();

  // Fetch all activities (limit to a reasonable number for static generation)
  const activities = await getEnrichedActivities(db, { limit: 200 });

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground">
            Latest contributions from {config.org.name} community
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Showing {activities.length} recent activities
        </p>

        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem key={activity.slug} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

