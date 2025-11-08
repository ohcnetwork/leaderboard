import Link from "next/link";
import { getConfig } from "@/lib/config";
import { Github, Linkedin, Youtube, Mail } from "lucide-react";

export function Footer() {
  const config = getConfig();
  const socials = config.org.socials;

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {config.org.logo_url && (
                <img
                  src={config.org.logo_url}
                  alt={config.org.name}
                  className="h-8 w-8 object-contain"
                />
              )}
              <span className="font-semibold text-lg">{config.org.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.org.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/people"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  People
                </Link>
              </li>
              <li>
                <Link
                  href="/feed"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Activity Feed
                </Link>
              </li>
              {config.org.url && (
                <li>
                  <a
                    href={config.org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Official Website
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              {socials?.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {socials?.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {socials?.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {socials?.email && (
                <a
                  href={`mailto:${socials.email}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
            {config.org.start_date && (
              <p className="text-xs text-muted-foreground mt-4">
                Since {new Date(config.org.start_date).getFullYear()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {config.org.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

