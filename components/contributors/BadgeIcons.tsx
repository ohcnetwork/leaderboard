"use client";

import { useState, useRef, useEffect, RefObject } from "react";
import Sparkle from "../Sparkles";
import { GraduateAttribute } from "@/config/GraduateAttributes";
import Image from "next/image";

function useOnClickOutside(
  ref: RefObject<HTMLInputElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (event: any) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

type Skill = GraduateAttribute & {
  currentLevel?: GraduateAttribute["levels"][number];
};

export default function BadgeIcons({ skill }: { skill: Skill }) {
  const [showModel, setShowModel] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useOnClickOutside(ref, () => setShowModel(false));

  const glow = () => {
    const currentLevel =
      skill.levels
        .map((l) => l.value)
        .indexOf(skill.currentLevel?.value ?? -1) + 1;

    switch (skill.levels.length - currentLevel) {
      case 0:
        return "glow-gold";

      case 1:
        return "glow-silver";

      default:
        return "";
    }
  };

  return (
    <div ref={ref} className="" role="listitem">
      <div className="relative h-14 w-14 cursor-pointer">
        <Image
          onClick={() => setShowModel(!showModel)}
          className={
            skill.currentLevel ? `badge-glow ${glow()}` : "opacity-30 grayscale"
          }
          height={56}
          width={56}
          src={skill.icon}
          alt="Graduate attribute"
        />
        {skill.currentLevel && (
          <div className="absolute bottom-0 right-0 z-0 flex items-center justify-center rounded bg-white px-1 py-0.5 leading-tight">
            <span className="text-xs font-medium text-black">
              {skill.currentLevel.label}
            </span>
          </div>
        )}

        {/* model */}

        <div
          className={`absolute inset-auto right-[calc(50%-125px)] z-20 mx-0 mt-1 w-[250px] translate-y-5 rounded-lg bg-secondary-200 text-black shadow-2xl transition-all dark:bg-secondary-800 dark:text-white md:top-[calc(100%+10px)] ${
            showModel
              ? "visible translate-y-0 opacity-100"
              : "invisible opacity-0"
          }`}
        >
          <div className="flex items-center justify-center rounded-t-lg border-b border-secondary-700 bg-secondary-300 px-4 py-3 dark:bg-secondary-700">
            <div className="relative h-24 w-24">
              {skill.currentLevel && (
                <>
                  {/* Yayy sparkles!! */}
                  <Sparkle
                    style={{
                      top: "20px",
                      left: "0px",
                      "--size": "10px",
                      "--rotate": "20deg",
                      "--delay": "1s",
                    }}
                  />
                  <Sparkle
                    style={{
                      bottom: "20px",
                      right: "0px",
                      "--size": "15px",
                      "--rotate": "50deg",
                      "--delay": "2s",
                    }}
                  />
                  <Sparkle
                    style={{
                      bottom: "10px",
                      left: "20px",
                      "--size": "15px",
                      "--rotate": "-20deg",
                      "--delay": "3s",
                    }}
                  />
                </>
              )}
              <Image
                onClick={() => setShowModel(!showModel)}
                className={`mx-auto ${
                  skill.currentLevel
                    ? `badge-glow ${glow()}`
                    : "opacity-30 grayscale"
                }`}
                fill
                src={skill.icon}
                alt="Graduate attribute"
              />
            </div>

            <i className="fas fa-circle" />
          </div>
          <div className="bg-white px-4 pb-4 pt-2 text-black dark:bg-secondary-800 dark:text-white">
            <p className="pb-2 font-bold text-foreground">{skill.label}</p>
            <div className="space-y-1 text-sm">
              {skill.levels.map((level: any, index: number) => (
                <div
                  key={level.value}
                  className="flex items-center font-medium text-secondary-500 dark:text-secondary-300"
                >
                  <p
                    className={`shrink-0 rounded px-1 py-0.5 ${
                      index <=
                      skill.levels.findIndex(
                        (l) => l.value === skill.currentLevel?.value,
                      )
                        ? "bg-green-400 text-white"
                        : "bg-secondary-400 opacity-40 grayscale dark:bg-secondary-700"
                    }`}
                  >
                    {level.label}
                  </p>
                  <div className="grow pl-4">
                    <p
                      className={`flex items-center ${
                        index <=
                        skill.levels.findIndex(
                          (l) => l.value === skill.currentLevel?.value,
                        )
                          ? "text-green-500"
                          : "opacity-40 grayscale"
                      }`}
                    >
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
