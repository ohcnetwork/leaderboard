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
        <div className="inset-x-0 md:inset-auto absolute z-20 bg-white rounded-lg shadow-2xl md:max-w-xs mt-1 mx-4 md:mx-0">
          <div className="bg-gray-50 rounded-t-lg px-4 py-2 border-b">
            <img
              onClick={() => setShowModel(!showModel)}
              className={`w-24 h-24 mx-auto ${skill.currentLevel ? "" : "grayscale opacity-30"}`}
              src={skill.icon}
              alt="Graduate attribute"
            />
          </div>
          <div className="px-4 pt-2 pb-4">
            <p className="font-bold pb-2">{skill.label}</p>
            <div className="space-y-1 text-sm">
            {skill.levels.map((level) => (
              <div key={level.value} className="flex items-center font-medium">
                <p
                  className={`flex-shrink-0 bg-gray-100 px-1 py-0.5 rounded ${
                    skill.currentLevel?.value >= level.value
                      ? "bg-green-500 text-white"
                      : ""
                  }`}
                >
                  {level.label}
                </p>
                <div className="flex-grow pl-4">
                  <p
                    className={`flex items-center ${
                      skill.currentLevel?.value >= level.value
                        ? "text-green-700"
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
      )}
    </div>
  );
}
