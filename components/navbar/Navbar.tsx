"use client";
import { useState } from "react";
import ThemeSwitch from "../ThemeSwitch";
import ContributeButton from "./ContributeButton";
import MenuItems from "./MenuItems";
import Logo from "./Logo";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 px-4 py-1 font-inter backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="hidden lg:flex">
            <MenuItems />
          </div>
          <div className="align-center flex flex-row justify-center gap-4">
            <ContributeButton />
            <ThemeSwitch />
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
        {open && (
          <div className="px-2 py-1 transition-transform duration-300 ease-in-out lg:hidden">
            <MenuItems />
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
