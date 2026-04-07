"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface Contributor {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  totalPoints: number;
}

interface Role {
  key: string;
  name: string;
  description?: string;
}

interface PeopleViewProps {
  contributors: Contributor[];
  roles: Role[];
  orgName: string;
}

export default function PeopleView({
  contributors,
  roles,
  orgName,
}: PeopleViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "gallery" ? "gallery" : "normal";

  const setView = (v: "normal" | "gallery") => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "gallery") {
      params.set("view", "gallery");
    } else {
      params.delete("view");
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const contributorsByRole = useMemo(() => {
    const grouped = new Map<string, Contributor[]>();
    for (const role of roles) {
      grouped.set(role.key, []);
    }
    for (const contributor of contributors) {
      const list = grouped.get(contributor.role);
      if (list) {
        list.push(contributor);
      }
    }
    return grouped;
  }, [contributors, roles]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          Our People
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
          Meet the <strong>{contributors.length}</strong> amazing contributors
          who make {orgName} possible
        </p>
      </div>

      {/* View Switcher */}
      <div className="flex justify-center sm:justify-end mb-6 max-w-7xl mx-auto px-2 sm:px-0">
        <div className="flex gap-1 border rounded-md p-0.5">
          <Button
            variant={view === "normal" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("normal")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "gallery" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("gallery")}
            aria-label="Gallery view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {view === "normal" ? (
        <div className="max-w-7xl mx-auto">
          <NormalView roles={roles} contributorsByRole={contributorsByRole} />
        </div>
      ) : (
        <GalleryView contributors={contributors} />
      )}

      {/* Stats */}
      <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground px-2">
        <p>
          Showing {contributors.length} contributors across {roles.length} roles
        </p>
      </div>
    </div>
  );
}

function NormalView({
  roles,
  contributorsByRole,
}: {
  roles: Role[];
  contributorsByRole: Map<string, Contributor[]>;
}) {
  return (
    <div className="space-y-8 sm:space-y-12">
      {roles.map((role) => {
        const members = contributorsByRole.get(role.key);
        if (!members || members.length === 0) return null;

        return (
          <section key={role.key}>
            <div className="mb-4 sm:mb-6 px-2 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold">{role.name}</h2>
              {role.description && (
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {role.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {members.map((contributor) => (
                <Link
                  key={contributor.username}
                  href={`/${contributor.username}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-3 sm:p-4 transition-all hover:shadow-md hover:border-foreground/20"
                >
                  <Avatar className="size-14 sm:size-16 transition-transform group-hover:scale-105">
                    <AvatarImage
                      src={contributor.avatar_url || undefined}
                      alt={contributor.name || contributor.username}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {(contributor.name || contributor.username)
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center min-w-0 w-full">
                    <p className="font-medium truncate text-xs sm:text-sm group-hover:text-foreground transition-colors">
                      {contributor.name || contributor.username}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      @{contributor.username}
                    </p>
                    {contributor.totalPoints > 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {contributor.totalPoints.toLocaleString()} pts
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function GalleryView({ contributors }: { contributors: Contributor[] }) {
  return (
    <div className="people-avatar-grid grid gap-(--people-grid-gap) px-2 sm:px-0 max-w-7xl mx-auto">
      {contributors.map((contributor) => (
        <Tooltip key={contributor.username}>
          <TooltipTrigger asChild>
            <Link
              href={`/${contributor.username}`}
              className="group block aspect-square"
            >
              <Avatar className="w-full h-full rounded-md transition-all hover:ring-4 hover:ring-foreground/20 hover:scale-105">
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
  );
}
