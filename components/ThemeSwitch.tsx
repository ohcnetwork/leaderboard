"use client";

import { useTheme } from "next-themes";
import { useState } from "react";

// icons
import { MdOutlineLightMode } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";

export default function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  useState(() => {
    setTheme("dark");
  });
  

  if (!theme) {
    return (
      <div className={`flex justify-center items-center p-1 gap-2 rounded-md cursor-pointer bg-indigo-950`}>
      <div onClick={() => setTheme("light")} className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 ease-in-out transform bg-transparent`}>
        <MdOutlineLightMode className="text-lg" />
      </div>
      <div onClick={() => setTheme("dark")} className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 ease-in-out transform  bg-gray-900`}>
        <MdOutlineDarkMode className="text-lg" />
      </div>
    </div>
    )
  }

  return (
    <div className={`flex justify-center items-center p-1 gap-2 rounded-md cursor-pointer ${theme === 'light' ? 'bg-gray-100' : 'bg-indigo-950'}`}>
      <div onClick={() => setTheme("light")} className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 ease-in-out transform ${theme === 'light' ? 'bg-white' : 'bg-transparent'}`}>
        <MdOutlineLightMode className="text-lg" />
      </div>
      <div onClick={() => setTheme("dark")} className={`flex justify-center items-center p-2 rounded-md transition-all duration-300 ease-in-out transform  ${theme === 'dark' ? 'bg-gray-900' : 'bg-transparent'}`}>
        <MdOutlineDarkMode className="text-lg" />
      </div>
    </div>
  );
}
