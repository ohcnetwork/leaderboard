import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { getConfig } from "@/lib/config/get-config";
import Link from "next/link";
import ThemeSelector from "./ThemeSelector";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get config for metadata
const config = getConfig();

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootProvider>
            <div className="min-h-screen flex flex-col">
              <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3">
                      <Image
                        src={config.org.logo_url}
                        alt={config.org.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <span className="font-semibold text-lg">
                        {config.org.name}
                      </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                      <Link
                        href="/"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        Home
                      </Link>
                      <Link
                        href="/leaderboard"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        Leaderboard
                      </Link>
                      <Link
                        href="/people"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        People
                      </Link>
                      <Link
                        href="/badges"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        Badges
                      </Link>
                      <Link
                        href="/docs"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        Docs
                      </Link>
                    </nav>
                  </div>
                  <ThemeSelector />
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                  <p>
                    © {new Date().getFullYear()} {config.org.name}. All rights
                    reserved.
                  </p>
                </div>
              </footer>
            </div>
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
