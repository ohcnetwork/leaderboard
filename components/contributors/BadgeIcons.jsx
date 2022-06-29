/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from "react";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
export default function BadgeIcons({ skill }) {
  const [showModel, setShowModel] = useState();
  const ref = useRef();
  useOnClickOutside(ref, () => setShowModel(false));
  return (
    <div ref={ref} className="" role="listitem">
      <img
        onClick={() => setShowModel(!showModel)}
        className={skill.currentLevel ? "" : "grayscale opacity-30"}
        src={skill.icon}
        alt="Graduate attribute"
      />
      {skill.currentLevel && (
        <div className="z-40 absolute -mt-3 ml-2">
          <span className="text-white">{skill.currentLevel.label}</span>
        </div>
      )}
      {/* model */}
      {showModel && (
        <div className="absolute bg-white rounded-lg shadow-lg p-4 w-60">
          <div className="font-bold">{skill.label}</div>
          {skill.levels.map((level) => (
            <div key={level.value} className="flex items-center">
              <div
                className={`flex-shrink-0 ${
                  skill.currentLevel?.value >= level.value
                    ? "text-green-600"
                    : ""
                }`}
              >
                {level.label}
              </div>
              <div className="flex-grow pl-4">
                <div
                  className={`flex items-center ${
                    skill.currentLevel?.value >= level.value
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  {level.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
