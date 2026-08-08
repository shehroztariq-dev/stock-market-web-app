import { searchStocks } from "@/lib/actions/finnhub.actions";
import Image from "next/image";
import Link from "next/link";
import NavItems from "./nav-items";
import UserDropDown from "./user-dropdown";

export default async function Header({ user }: { user: User }) {
  const initialStocks = await searchStocks();
  return (
    <header className="sticky top-0 bg-gray-800 shadow-2xl z-10">
      <div className="px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={"/"} className="flex items-center gap-2">
            <Image src={"/logo.svg"} alt="logo" width={26} height={26} />
            <span className="text-xl font-black font-sans">Growex</span>
          </Link>

          <div className="hidden sm:block w-px h-6 bg-gray-600" />

          <nav className="hidden sm:block">
            <NavItems initialStocks={initialStocks} />
          </nav>
        </div>
        <UserDropDown user={user} />
      </div>
    </header>
  );
}
