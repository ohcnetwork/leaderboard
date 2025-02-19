import "./globals.css";
import "./badges.css";

import { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/navbar/Navbar";
import Provider from "@/app/provider";
import { env } from "@/env.mjs";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_META_URL),
  title: env.NEXT_PUBLIC_PAGE_TITLE,
  description: env.NEXT_PUBLIC_META_DESCRIPTION,
  openGraph: {
    title: env.NEXT_PUBLIC_META_TITLE,
    description: env.NEXT_PUBLIC_META_DESCRIPTION,
    images: env.NEXT_PUBLIC_META_IMG,
    type: "article",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col justify-between">
          <Provider>
            <div>
              <Navbar />
              {children}
            </div>
            <Footer />
          </Provider>
        </div>
      </body>
    </html>
  );
}
