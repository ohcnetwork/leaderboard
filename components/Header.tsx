"use client";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";
import { env } from "@/env.mjs";
import { navLinks } from "@/lib/utils";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-around gap-10 px-4  py-4 sm:flex-row lg:py-8  xl:px-0 ">
      <div className="flex items-center justify-between">
        <Link className="inline-block cursor-pointer" href="/">
          <h1 className="flex cursor-pointer flex-col items-end text-4xl text-primary-400">
            {env.NEXT_PUBLIC_ORG_NAME || "Open Source"}
            <span className="block text-xl font-bold tracking-normal text-gray-600 dark:text-gray-400">
              Contributors
            </span>
          </h1>
        </Link>
      </div>
      {/* Theme Switch */}
      <ThemeSwitch className="lg:hidden" />
      {/* Mobile View Navbar */}
      <div className="sm:hidden">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 dark:text-gray-400"
        >
          {isSidebarOpen ? (
            <FiX className="text-3xl" />
          ) : (
            <FiMenu className="text-3xl" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[53%] bg-white dark:bg-gray-800 sm:hidden ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-full w-full flex-col gap-5 bg-gray-300 px-6 py-4 dark:bg-gray-800">
          <div className="flex justify-end">
            {/* Close Sidebar Button */}
            <button
              onClick={toggleSidebar}
              className="mt-3 self-center text-gray-600 dark:text-gray-400"
            >
              <FiX className="text-3xl" />
            </button>
          </div>
          {/* Sidebar Links */}
          <ul className="mt-5 flex flex-col gap-4">
            {navLinks.map((nav, index) => (
              <li
                key={index}
                className="text-lg font-bold text-gray-600 hover:underline dark:text-gray-400"
              >
                <Link href={nav.path}>{nav.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Desktop View Navbar */}
      <div className="hidden items-center sm:block ">
        <ul className="flex w-full items-center gap-12 overflow-hidden text-xl font-bold tracking-normal text-gray-600 dark:text-gray-400 ">
          {navLinks.map((nav, index) => (
            <li key={index} className="hover:text-primary-400 hover:underline ">
              <Link href={nav.path}>{nav.title}</Link>
            </li>
          ))}
        </ul>
      </div>
      <ThemeSwitch className="hidden items-center sm:inline" />
    </header>
  );
}
