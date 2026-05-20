"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { usePathname } from "next/navigation";

export default function NavItems() {
  const pathname = usePathname();

  const isActice = (path: string) => {};
  return (
    <ul className="flex gap-4">
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="hover:text-cyan-500 text-gray-400">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
