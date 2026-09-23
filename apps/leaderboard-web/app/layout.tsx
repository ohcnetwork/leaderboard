import { ThemeProvider } from "@/components/theme-provider";
import { getConfig } from "@/lib/config/get-config";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { PT_Serif, Space_Grotesk, Space_Mono } from "next/font/google";
import Footer from "./Footer";
import "./globals.css";
import NavHeader from "./NavHeader";

import SearchCommand from "@/components/SearchCommand";
import { getAllContributors } from "@/lib/data/loader";

const fontSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// Get config for metadata
const config = getConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.meta.site_url),
  title: config.meta.title,
  description: config.meta.description,
  icons: {
    icon: config.meta.favicon_url,
  },
  openGraph: {
    title: config.meta.title,
    description: config.meta.description,
    images: [config.meta.image_url],
    url: config.meta.site_url,
  },
  twitter: {
    card: "summary_large_image",
    title: config.meta.title,
    description: config.meta.description,
    images: [config.meta.image_url],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const contributors = await getAllContributors();
  const searchItems = [
    {
      title: "Home",
      href: "/",
      group: "Pages",
      keywords: ["home", "dashboard"],
    },
    {
      title: "Leaderboard",
      href: "/leaderboard",
      group: "Pages",
      keywords: ["leaderboard", "ranking", "points", "scores"],
    },
    {
      title: "People",
      href: "/people",
      group: "Pages",
      keywords: ["people", "contributors", "members"],
    },
    {
      title: "Badges",
      href: "/badges",
      group: "Pages",
      keywords: ["badges", "achievements", "awards"],
    },

    ...contributors.map((contributor) => ({
      title: contributor.name || contributor.username,
      href: `/${contributor.username}`,
      group: "Contributors",
      keywords: [contributor.username, contributor.name || ""],
    })),
  ];
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootProvider>
            <div className="min-h-screen flex flex-col">
              <NavHeader
                orgName={config.org.name}
                logoUrl={config.org.logo_url}
                githubUrl={config.org.socials?.github}
              />
              <SearchCommand items={searchItems} />
              <main className="flex-1 pt-16 sm:pt-24">{children}</main>
              <Footer config={config} />
            </div>
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
