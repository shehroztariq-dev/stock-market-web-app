"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NavItems = () => {
  const pathname = usePathname();
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <ul className="flex items-center gap-1 text-sm font-medium">
      {NAV_ITEMS.filter((i) => i.href !== "/search").map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              isActive(href)
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
            )}>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
};
export default NavItems;
