"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const HoverInfocard = dynamic(() => import("./HoverInfocard"), {
  ssr: false,
  loading: () => (
    <div
      className="max-h-64 w-44 overflow-hidden rounded-lg border-2 border-primary-700 bg-secondary-300 p-1 dark:bg-secondary-800 md:pb-2 xl:text-left"
      role="listitem"
    >
      <span>Loading</span>
      <div>
        <span className="animate-[pulse_1s_infinite_100ms]">.</span>
        <span className="animate-[pulse_1s_infinite_200ms]">.</span>
        <span className="animate-[pulse_1s_infinite_300ms]">.</span>
      </div>
    </div>
  ),
});

export default function HoverCardWrapper({
  github,
  name,
  title,
  content,
  children,
}: {
  github: string;
  name: string;
  title: string;
  content: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      <div className="absolute right-0 mt-1.5 translate-x-16 opacity-0 group-hover:opacity-100">
        {hover && (
          <HoverInfocard
            github={github}
            name={name}
            title={title}
            content={content}
          />
        )}
      </div>
    </div>
  );
}
