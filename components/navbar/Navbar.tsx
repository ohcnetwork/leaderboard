"use client";
import { useState } from "react";
import ThemeSwitch from "../ThemeSwitch";
import ContributeButton from "./ContributeButton";
import MenuItems from "./MenuItems";
import Logo from "./Logo";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 px-4 py-1 backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="hidden lg:flex">
            <MenuItems />
          </div>
          <div className="align-center flex flex-row justify-center gap-4">
            <div className="hidden items-center justify-center md:flex">
              <ContributeButton />
            </div>
            <div className="hidden items-center justify-center md:flex">
              <ThemeSwitch />
            </div>
            <div
              className="flex  cursor-pointer items-center justify-center transition-transform duration-300 ease-in-out lg:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <IoClose className="text-3xl" />
              ) : (
                <RxHamburgerMenu className="text-3xl" />
              )}
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div
          className={`fixed inset-y-0 right-0 z-50 w-[53%] bg-white dark:bg-gray-800 sm:hidden ${open ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}
        >
          <div className="relative flex h-full w-full flex-col gap-5 bg-gray-300 px-6 py-4 dark:bg-gray-800">
            <div className="flex justify-end">
              <button
                onClick={() => setOpen(!open)}
                className="mt-3 self-center text-gray-600 dark:text-gray-400"
              >
                <IoClose className="text-3xl" />
              </button>
            </div>
            <Sidebar />
            <ContributeButton />
            <div className="absolute bottom-7 left-0 w-full items-center">
              <ThemeSwitch />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
