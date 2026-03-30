import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { getConfig } from "@/lib/config/get-config";
import Link from "next/link";
import ThemeSelector from "./ThemeSelector";
import Image from "next/image";
import MobileNavigation from "./MobileNavigation";
import { navigationItems } from "./navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();

  return {
    title: {
      default: config.meta.title,
      template: `%s | ${config.meta.title}`,
    },
    description: config.meta.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();

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
            <div className="min-h-screen bg-background flex flex-col">
              <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4">
                  <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                      <Link href="/" className="flex items-center gap-2">
                        <Image
                          src={config.org.logo}
                          alt={config.org.name}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                        <span className="font-semibold text-lg hidden sm:block">
                          {config.org.name}
                        </span>
                      </Link>
                      <nav
                        className="hidden md:flex items-center gap-6"
                        aria-label="Primary navigation"
                      >
                        {navigationItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>
                    <div className="flex items-center gap-2">
                      <MobileNavigation />
                      <ThemeSelector />
                    </div>
                  </div>
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
