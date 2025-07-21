"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";

type PosterGeneratorProps = {
  children: React.ReactNode;
  aspectRatio: "1:1" | "9:16";
  filename: string;
};

export default function PosterGenerator({
  children,
  aspectRatio,
  filename,
}: PosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 5, // Higher resolution
        backgroundColor: null, // Preserve transparency
        useCORS: true, // Allow loading cross-origin images
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating poster:", error);
    }
  };

  return (
    <div className="relative">
      <div
        ref={posterRef}
        className={`relative overflow-hidden rounded-lg border border-primary-500 p-4 ${
          aspectRatio === "1:1" ? "aspect-square" : "aspect-[9/16]"
        }`}
      >
        {children}
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 w-full rounded-md bg-primary-500 px-4 py-2 font-semibold text-white hover:bg-primary-600"
      >
        Download{" "}
        {aspectRatio === "1:1"
          ? "LinkedIn Poster (1:1)"
          : "Instagram Story (9:16)"}
      </button>
    </div>
  );
}
