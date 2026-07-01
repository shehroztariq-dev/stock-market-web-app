"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { cn, getChangeColorClass } from "@/lib/utils";

// "Alert" is not part of this release; keep the other columns.
const COLUMNS = WATCHLIST_TABLE_HEADER.filter((h) => h !== "Alert");

export default function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const [rows, setRows] = useState(watchlist);
  const [pendingRemoval, setPendingRemoval] = useState<StockWithData | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const confirmRemoval = () => {
    const target = pendingRemoval;
    if (!target) return;
    startTransition(async () => {
      const result = await removeFromWatchlist(target.symbol);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRows((r) => r.filter((x) => x.symbol !== target.symbol));
      toast.success(`${target.symbol} removed from your watchlist`);
      setPendingRemoval(null);
    });
  };

  if (rows.length === 0) {
    // Everything was removed in this session.
    return (
      <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Your watchlist is empty. Search for a stock to add one.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Your watchlist</caption>
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              {COLUMNS.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-medium",
                    ["Price", "Change", "Market Cap", "P/E Ratio"].includes(h) &&
                      "text-right",
                  )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.symbol}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
                <td className="max-w-56 truncate px-4 py-3 font-medium">
                  <Link
                    href={`/stocks/${encodeURIComponent(row.symbol)}`}
                    className="rounded-sm hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                    {row.company}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">
                  {row.symbol}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.priceFormatted}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right tabular-nums",
                    getChangeColorClass(row.changePercent),
                  )}>
                  {row.changeFormatted}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.marketCap}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.peRatio}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${row.symbol} from watchlist`}
                    onClick={() => setPendingRemoval(row)}
                    className="text-muted-foreground hover:text-destructive">
                    <Trash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!pendingRemoval}
        onOpenChange={(open) => !open && !isPending && setPendingRemoval(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {pendingRemoval?.symbol}?</DialogTitle>
            <DialogDescription>
              {pendingRemoval?.company} will be removed from your watchlist and
              your daily news digest. You can add it back anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmRemoval}
              disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
