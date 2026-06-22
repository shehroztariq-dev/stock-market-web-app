import Image from "next/image";
import Link from "next/link";
import React from "react";
import NavItems from "./nav-items";
import UserDropDown from "./user-dropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";

export default async function Header({ user }: { user: User }) {
  const initialStocks = await searchStocks();
  return (
    <header className="sticky top-0 bg-accent z-10">
      <div className="px-10 py-4 flex items-center justify-between">
        <Link href={"/"} className="flex items-center gap-2 ">
          <Image src={"/logo.svg"} alt="logo" width={34} height={34} />
          <span className="text-2xl font-black font-sans">Growix</span>
        </Link>
        <nav className="hidden sm:block">
          <NavItems initialStocks={initialStocks} />
        </nav>
        <UserDropDown user={user} />
      </div>
    </header>
  );
}
