import Image from "next/image";
import Link from "next/link";
import React from "react";
import NavItems from "./nav-items";
import UserDropDown from "./user-dropdown";

export default function Header() {
  return (
    <header className="sticky top-0 bg-accent">
      <div className="px-10 py-4 flex items-center justify-between">
        <Link href={"/"} className="flex items-center gap-2 ">
          <Image src={"/logo.svg"} alt="logo" width={34} height={34} />
          <span className="text-2xl font-black font-sans">Growix</span>
        </Link>
        <nav className="hidden md:block">
          <NavItems />
        </nav>
        <UserDropDown />
      </div>
    </header>
  );
}
