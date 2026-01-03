import { getAllContributorsWithAvatars } from "@/lib/data/loader";
import { getConfig } from "@/lib/config/get-config";
import { getHiddenRoles } from "@/lib/config/helpers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  const hiddenRoles = getHiddenRoles();
  const contributors = await getAllContributorsWithAvatars(hiddenRoles);

  return {
    title: `People - ${config.meta.title}`,
    description: `Meet the ${contributors.length} contributors who make ${config.org.name} possible. View all community members and their contributions.`,
    openGraph: {
      title: `People - ${config.meta.title}`,
      description: `Meet the ${contributors.length} contributors who make ${config.org.name} possible.`,
      url: `${config.meta.site_url}/people`,
      siteName: config.meta.title,
      images: [config.meta.image_url],
    },
  };
}

export default async function PeoplePage() {
  const config = getConfig();
  const hiddenRoles = getHiddenRoles();
  const contributors = await getAllContributorsWithAvatars(hiddenRoles);

  return (
    <div className="mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our People</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Meet the {contributors.length} amazing contributors who make{" "}
          {config.org.name} possible
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="people-avatar-grid grid gap-(--people-grid-gap)">
        {contributors.map((contributor) => (
          <Tooltip key={contributor.username}>
            <TooltipTrigger asChild>
              <Link
                href={`/${contributor.username}`}
                className="group block aspect-square"
              >
                <Avatar className="w-full h-full rounded-md transition-all hover:ring-4 hover:ring-primary/50 hover:scale-105">
                  <AvatarImage
                    src={contributor.avatar_url || undefined}
                    alt={contributor.name || contributor.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-md">
                    {(contributor.name || contributor.username)
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent>@{contributor.username}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Showing {contributors.length} contributors sorted by total points</p>
      </div>
    </div>
  );
}
