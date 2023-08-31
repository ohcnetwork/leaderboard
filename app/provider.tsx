"use client";
import { ThemeProvider } from "next-themes";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}
