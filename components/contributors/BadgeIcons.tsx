"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect, RefObject } from "react";
import Sparkle from "../Sparkles";
import { GraduateAttribute } from "@/config/GraduateAttributes";
import Image from "next/image";

function useOnClickOutside(
  ref: RefObject<HTMLInputElement>,
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
      <div className="relative w-14 h-14 cursor-pointer">
        <Image
          onClick={() => setShowModel(!showModel)}
          className={
            skill.currentLevel ? `badge-glow ${glow()}` : "grayscale opacity-30"
          }
          height={56}
          width={56}
          src={skill.icon}
          alt="Graduate attribute"
        />
        {skill.currentLevel && (
          <div className="bg-white flex items-center justify-center absolute rounded bottom-0 right-0 z-10 py-0.5 px-1 leading-tight">
            <span className="text-xs font-medium text-black">
              {skill.currentLevel.label}
            </span>
          </div>
        )}

        {/* model */}

        <div
          className={`inset-x-0 md:top-[calc(100%+10px)] md:inset-auto md:-left-[calc(125px-50%)] absolute z-20 bg-gray-800 rounded-lg shadow-2xl md:w-[250px] translate-y-5 transition-all mt-1 mx-4 md:mx-0 text-white ${
            showModel
              ? "opacity-100 translate-y-0 visible"
              : "invisible opacity-0"
          }`}
        >
          <div className="bg-gray-900 rounded-t-lg px-4 py-3 border-b border-gray-700 flex justify-center items-center">
            <div className="w-24 h-24 relative">
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
                      "--size": "25px",
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
                    : "grayscale opacity-30"
                }`}
                layout="fill"
                src={skill.icon}
                alt="Graduate attribute"
              />
            </div>

            <i className="fas fa-circle" />
          </div>
          <div className="px-4 pt-2 pb-4">
            <p className="font-bold pb-2">{skill.label}</p>
            <div className="space-y-1 text-sm">
              {skill.levels.map((level: any) => (
                <div
                  key={level.value}
                  className="flex items-center font-medium text-gray-400"
                >
                  <p
                    className={`flex-shrink-0 bg-gray-700 px-1 py-0.5 rounded ${
                      skill.currentLevel?.value ?? -1 >= level.value
                        ? "bg-green-400 text-white"
                        : ""
                    }`}
                  >
                    {level.label}
                  </p>
                  <div className="flex-grow pl-4">
                    <p
                      className={`flex items-center ${
                        skill.currentLevel?.value ?? -1 >= level.value
                          ? "text-green-500"
                          : ""
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
