import type { Config } from "@/lib/config/schema";
import cronstrue from "cronstrue";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  Database,
  ExternalLink,
  Github,
  Heart,
  Linkedin,
  Mail,
  MapIcon,
  Slack,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LEADERBOARD_REPO_URL = "https://github.com/ohcnetwork/leaderboard";

const socialIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  github: Github,
  slack: Slack,
  linkedin: Linkedin,
  youtube: Youtube,
  email: Mail,
};

const pageLinks = [
  { name: "Home", href: "/" },
  { name: "People", href: "/people" },
  { name: "Badges", href: "/badges" },
  { name: "Docs", href: "/docs" },
];

const leaderboardLinks = [
  { name: "This Week", href: "/leaderboard/week" },
  { name: "This Month", href: "/leaderboard/month" },
  { name: "This Year", href: "/leaderboard/year" },
];

function getBuildingSinceText(startDate: string): string {
  try {
    const start = new Date(startDate);
    return `Building since ${formatDistanceToNow(start, { addSuffix: false })}`;
  } catch {
    return "";
  }
}

function getCronDescription(cronExpression: string): string | null {
  try {
    return cronstrue.toString(cronExpression, { use24HourTimeFormat: false });
  } catch {
    return null;
  }
}

function getFormattedBuildTime(): string | null {
  const timestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;
  if (!timestamp) return null;
  try {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return null;
  }
}

function getDataSourceDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.replace(/^\//, "").split("/");
    if (parsed.hostname === "github.com" && pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }
    return parsed.hostname + parsed.pathname;
  } catch {
    return url;
  }
}

interface FooterProps {
  config: Config;
}

export default function Footer({ config }: FooterProps) {
  const { org, leaderboard } = config;
  const socials = org.socials ?? {};
  const socialEntries = Object.entries(socials).filter(
    ([, url]) => url != null && url.length > 0,
  );

  const buildTime = getFormattedBuildTime();
  const cronDescription = leaderboard.data_update_frequency
    ? getCronDescription(leaderboard.data_update_frequency)
    : null;
  const buildingSince = org.start_date
    ? getBuildingSinceText(org.start_date)
    : null;

  const showDataExplorer = leaderboard.data_explorer?.enabled !== false;

  const allPageLinks = showDataExplorer
    ? [
        ...pageLinks.slice(0, 2),
        { name: "Data Explorer", href: "/data" },
        ...pageLinks.slice(2),
      ]
    : pageLinks;

  return (
    <footer className="border-t mt-16 pb-24 lg:pb-0">
      <div className="container mx-auto px-6 py-12 lg:py-16">
        {/* Top: Org identity + Link columns */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Org Identity */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src={org.logo_url}
                alt={org.name}
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {org.name}
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {org.description}
            </p>

            {buildingSince && (
              <p className="text-sm text-muted-foreground/80 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {buildingSince}
              </p>
            )}

            {/* Social icons */}
            {socialEntries.length > 0 && (
              <div className="flex items-center gap-1 pt-2">
                {socialEntries.map(([key, url]) => {
                  const IconComponent = socialIconMap[key];
                  if (!IconComponent || !url) return null;
                  return (
                    <a
                      key={key}
                      href={key === "email" ? `mailto:${url}` : url}
                      target={key === "email" ? undefined : "_blank"}
                      rel={key === "email" ? undefined : "noopener noreferrer"}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label={key}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pages column */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Pages
            </h3>
            <ul className="space-y-2">
              {allPageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Leaderboard column */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Leaderboard
            </h3>
            <ul className="space-y-2">
              {leaderboardLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Status + Open Source column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status */}
            {(buildTime || cronDescription || leaderboard.data_source) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Status
                </h3>
                <ul className="space-y-2">
                  {buildTime && (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Built {buildTime}</span>
                    </li>
                  )}
                  {cronDescription && (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Updates {cronDescription.toLowerCase()}</span>
                    </li>
                  )}
                  {leaderboard.data_source && (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Database className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <a
                        href={leaderboard.data_source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {getDataSourceDisplay(leaderboard.data_source)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Open Source */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Open Source
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href={LEADERBOARD_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <Github className="h-3.5 w-3.5" />
                    Contribute to Leaderboard
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {org.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/sitemap.xml"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <MapIcon className="h-3.5 w-3.5" />
                Sitemap
              </Link>
              <span className="text-muted-foreground/50">·</span>
              <a
                href={LEADERBOARD_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Made with <Heart className="h-3 w-3 text-red-500" /> and open
                source
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
