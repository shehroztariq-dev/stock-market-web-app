"use client";

import { useState, useTransition } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";
import { cn } from "@/lib/utils";

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [pending, startTransition] = useTransition();

  const toggle = (e?: React.SyntheticEvent) => {
    // Used inside clickable rows / list items.
    e?.preventDefault();
    e?.stopPropagation();
    if (pending) return;

    const next = !added;
    setAdded(next); // optimistic

    startTransition(async () => {
      const result = next
        ? await addToWatchlist(symbol, company)
        : await removeFromWatchlist(symbol);

      if (!result.success) {
        setAdded(!next); // roll back
        toast.error(result.error);
        return;
      }
      toast.success(
        next ? `${symbol} added to your watchlist` : `${symbol} removed`,
      );
      onWatchlistChange?.(symbol, next);
    });
  };

  const label = added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`;

  if (type === "icon") {
    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={added}
        disabled={pending}
        onClick={toggle}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60">
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Star
            className={cn("size-4", added && "fill-primary text-primary")}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={added ? "outline" : "default"}
      aria-pressed={added}
      disabled={pending}
      onClick={toggle}
      className="h-10 w-full px-4 text-sm font-semibold sm:w-auto">
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : showTrashIcon && added ? (
        <Trash2 />
      ) : (
        <Star className={cn(added && "fill-primary text-primary")} />
      )}
      {added ? "In your watchlist" : "Add to watchlist"}
    </Button>
  );
};

export default WatchlistButton;
