import { getDb } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { getContributorsWithStats } from "@/lib/db";
import PeoplePageClient from "./page";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();

  return {
    title: `Contributors - ${config.meta.title}`,
    description: `Browse all contributors to ${config.org.name}`,
    openGraph: {
      title: `Contributors - ${config.meta.title}`,
      description: `Browse all contributors to ${config.org.name}`,
      url: `${config.meta.site_url}/people`,
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
      title: `Contributors - ${config.meta.title}`,
      description: `Browse all contributors to ${config.org.name}`,
      images: [config.meta.image_url],
    },
  };
}

export default async function PeopleLayout() {
  const config = getConfig();
  const db = getDb();

  const contributors = await getContributorsWithStats(db);

  return (
    <PeoplePageClient
      contributors={contributors}
      roles={config.leaderboard.roles}
    />
  );
}

