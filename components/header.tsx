import Image from "next/image";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import NavItems from "./nav-items";
import SearchCommand from "./search-command";
import UserDropDown from "./user-dropdown";

export default async function Header({ user }: { user: User }) {
  const initialStocks = await searchStocks();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <Image src="/logo.svg" alt="" width={28} height={28} priority />
            <span className="text-lg font-bold tracking-tight">Growex</span>
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <NavItems />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <SearchCommand initialStocks={initialStocks} />
          <UserDropDown user={user} />
        </div>
      </div>
    </header>
  );
}
