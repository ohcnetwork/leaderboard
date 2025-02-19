import Image from "next/image";
import { env } from "@/env.mjs";
import { FaYoutube, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import { ReactNode } from "react";
import { BsTwitterX } from "react-icons/bs";
import RelativeTime from "@/components/RelativeTime";

const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href?: string;
  icon: any;
  label: string;
}) =>
  href && (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 transition-colors duration-300 hover:text-[rgb(176,142,230)]"
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </a>
  );

const FooterSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="mb-6 md:mb-0">
    <h3 className="mb-3 text-lg font-semibold">{title}</h3>
    {children}
  </div>
);

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="mb-2 block text-sm text-gray-300 transition-colors duration-300 hover:text-[rgb(176,142,230)]"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 dark:bg-gray-800 dark:text-gray-300">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="mb-6 w-full md:mb-0 md:w-1/3">
            <FooterSection title="About Us">
              <div className="mb-4 flex items-center">
                <span className="mr-2 text-sm">Powered by</span>
                <a
                  href={env.NEXT_PUBLIC_ORG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={env.NEXT_PUBLIC_ORG_LOGO}
                    alt={env.NEXT_PUBLIC_ORG_NAME}
                    width={100}
                    height={24}
                  />
                </a>
              </div>
              <p className="max-w-xs text-sm text-gray-400">
                Connecting healthcare through open data and innovative
                solutions.
              </p>
            </FooterSection>
          </div>

          <div className="flex w-full flex-col items-end gap-4">
            <div className="flex w-full flex-col md:w-1/3 md:flex-row md:justify-end md:space-x-12">
              <FooterSection title="Resources">
                <FooterLink href={env.NEXT_PUBLIC_DATA_SOURCE}>
                  Data Repository
                </FooterLink>
                <FooterLink href={env.NEXT_PUBLIC_FLAT_REPO_EXPLORER_URL}>
                  Flat Repository Explorer
                </FooterLink>
              </FooterSection>

              <FooterSection title="Connect">
                <div className="flex space-x-4">
                  <SocialLink
                    href={env.NEXT_PUBLIC_YOUTUBE_URL}
                    icon={FaYoutube}
                    label="YouTube"
                  />
                  <SocialLink
                    href={env.NEXT_PUBLIC_LINKEDIN_URL}
                    icon={FaLinkedin}
                    label="LinkedIn"
                  />
                  <SocialLink
                    href={env.NEXT_PUBLIC_GITHUB_URL}
                    icon={FaGithub}
                    label="GitHub"
                  />
                  <SocialLink
                    href={
                      env.NEXT_PUBLIC_CONTACT_EMAIL &&
                      `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`
                    }
                    icon={FaEnvelope}
                    label="Email"
                  />
                  <SocialLink
                    href={env.NEXT_PUBLIC_X_URL}
                    icon={BsTwitterX}
                    label="Twitter"
                  />
                </div>
              </FooterSection>
            </div>

            <span className="text-end text-sm italic text-gray-400">
              <p>Leaderboard scrapes data frequently.</p>
              <p>
                Data was last updated{" "}
                <RelativeTime className="font-semibold" time={new Date()} />.
              </p>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
