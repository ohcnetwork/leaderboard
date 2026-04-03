"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Initializing WASM engine",
  "Loading SQLite worker",
  "Connecting to database",
  "Preparing query interface",
];

export default function LoadingAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-8 animate-in fade-in duration-300">
      {/* Animated database icon */}
      <div className="relative">
        <svg
          width="80"
          height="96"
          viewBox="0 0 80 96"
          fill="none"
          className="text-primary"
        >
          {/* Top ellipse */}
          <ellipse
            cx="40"
            cy="16"
            rx="36"
            ry="14"
            className="fill-primary/10 stroke-primary"
            strokeWidth="2"
          >
            <animate
              attributeName="ry"
              values="14;16;14"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Body */}
          <path
            d="M4 16 v48 c0 7.7 16.1 14 36 14 s36-6.3 36-14 V16"
            className="fill-primary/5 stroke-primary"
            strokeWidth="2"
          />

          {/* Middle ellipse line */}
          <ellipse
            cx="40"
            cy="44"
            rx="36"
            ry="14"
            className="fill-none stroke-primary/30"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;8"
              dur="1s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Bottom ellipse */}
          <ellipse
            cx="40"
            cy="64"
            rx="36"
            ry="14"
            className="fill-none stroke-primary/20"
            strokeWidth="1.5"
          />
        </svg>

        {/* Pulsing ring */}
        <div className="absolute inset-0 -m-4">
          <div className="w-full h-full rounded-full border-2 border-primary/20 animate-ping" />
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-28 h-28 animate-[spin_4s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-32 h-32 animate-[spin_6s_linear_infinite_reverse]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" />
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-3">
        <p
          key={messageIndex}
          className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {MESSAGES[messageIndex]}...
        </p>

        {/* Animated dots bar */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
