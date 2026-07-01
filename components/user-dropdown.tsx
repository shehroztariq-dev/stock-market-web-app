"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, Loader2, LogOut, Star } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth.actions";

export default function UserDropDown({ user }: { user: User }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const initial = user.name?.trim()?.[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    setSigningOut(true);
    const result = await signOut();
    if (!result.success) {
      setSigningOut(false);
      toast.error(result.error);
      return;
    }
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Account menu"
          className="h-9 gap-2 px-1.5 sm:px-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-medium md:block">
            {user.name}
          </span>
          <ChevronDown className="hidden opacity-60 md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col font-normal">
          <span className="truncate font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Primary navigation lives here on small screens */}
        <div className="md:hidden">
          <DropdownMenuItem asChild>
            <Link href="/">
              <LayoutDashboard /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/watchlist">
              <Star /> Watchlist
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </div>

        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}>
          {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
