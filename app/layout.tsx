import "./globals.css";
import "./badges.css";

import { Metadata } from "next";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Provider from "./provider";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PAGE_TITLE,
  description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
  openGraph: {
    title: process.env.NEXT_PUBLIC_META_TITLE,
    description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
    images: process.env.NEXT_PUBLIC_META_IMG,
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
        <Provider>
          <Header />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
