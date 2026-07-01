"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, TrendingUp } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import WatchlistButton from "@/components/watchlist-button";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export default function SearchCommand({
  renderAs = "button",
  label = "Search",
  initialStocks,
  className,
  enableShortcut = true,
  compact = true,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: SearchCommandProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const [searchTerm, setSearchTerm] = useState("");
  // Results are keyed by the term they answer, so stale responses can never
  // be shown for a newer query and no state needs resetting in effects.
  const [response, setResponse] = useState<{
    term: string;
    items: StockWithWatchlistStatus[];
    failed: boolean;
  } | null>(null);

  const debouncedTerm = useDebouncedValue(searchTerm.trim(), 300);
  const isSearchMode = searchTerm.trim().length > 0;

  // Global shortcut: Cmd/Ctrl + K
  useEffect(() => {
    if (!enableShortcut) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen, enableShortcut]);

  useEffect(() => {
    if (!open || !debouncedTerm) return;
    let cancelled = false;
    searchStocks(debouncedTerm)
      .then((items) => {
        if (!cancelled) setResponse({ term: debouncedTerm, items, failed: false });
      })
      .catch(() => {
        if (!cancelled)
          setResponse({ term: debouncedTerm, items: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedTerm, open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearchTerm("");
  };

  const select = (symbol: string) => {
    handleOpenChange(false);
    router.push(`/stocks/${encodeURIComponent(symbol)}`);
  };

  const trimmedTerm = searchTerm.trim();
  const current = response && response.term === trimmedTerm ? response : null;
  const waiting = isSearchMode && !current;
  const failed = !!current?.failed;
  const stocks = isSearchMode ? (current?.items ?? []) : initialStocks;
  const loading = waiting;

  return (
    <>
      {renderAs === "text" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "cursor-pointer transition-colors hover:text-primary",
            className,
          )}>
          {label}
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          aria-label={label}
          aria-keyshortcuts="Control+K Meta+K"
          className={cn(
            "h-9 gap-2 px-2.5 text-muted-foreground sm:px-3",
            className,
          )}>
          <Search />
          <span className={cn(compact && "hidden sm:inline")}>{label}</span>
          {enableShortcut && <kbd className="pointer-events-none ml-2 hidden rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground lg:inline">
            ⌘K
          </kbd>}
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search stocks"
        description="Search for a company or ticker symbol"
        className="top-[12%] sm:max-w-xl"
        commandProps={{ shouldFilter: false }}>
        <div className="relative">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search by company or ticker…"
            aria-label="Search stocks"
          />
          {loading && (
            <Loader2 className="absolute top-1/2 right-4 mt-0.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <CommandList className="max-h-[min(420px,60vh)]">
          {waiting ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          ) : failed ? (
            <div className="py-8 text-center text-sm text-destructive">
              Search failed. Please try again.
            </div>
          ) : stocks.length === 0 ? (
            <CommandEmpty className="py-8 text-muted-foreground">
              {isSearchMode
                ? `No results for “${searchTerm.trim()}”`
                : "Start typing to search for a stock."}
            </CommandEmpty>
          ) : (
            <CommandGroup
              heading={
                isSearchMode
                  ? `Search results (${stocks.length})`
                  : "Popular stocks"
              }>
              {stocks.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={stock.symbol}
                  onSelect={() => select(stock.symbol)}
                  className="gap-3 py-2.5">
                  <TrendingUp className="text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">
                      {stock.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {stock.symbol} · {stock.exchange} · {stock.type}
                    </div>
                  </div>
                  <WatchlistButton
                    symbol={stock.symbol}
                    company={stock.name}
                    isInWatchlist={stock.isInWatchlist}
                    type="icon"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
