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
      <div className="relative">
        <img
          onClick={() => setShowModel(!showModel)}
          className={skill.currentLevel ? "" : "grayscale opacity-30"}
          src={skill.icon}
          alt="Graduate attribute"
        />
        {skill.currentLevel && (
          <div className="bg-white flex items-center justify-center absolute rounded bottom-0 right-0 z-10 py-0.5 px-1 leading-tight">
            <span className="text-xs font-medium">{skill.currentLevel.label}</span>
          </div>
        )}
      </div>
      {/* model */}
      {showModel && (
        <div className="absolute z-20 bg-white rounded-lg shadow-lg p-4 max-w-xs">
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
