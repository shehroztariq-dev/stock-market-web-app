import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import SearchCommand from "@/components/search-command";
import WatchlistNews from "@/components/watchlist-news";
import WatchlistTable from "@/components/watchlist-table";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getNews } from "@/lib/finnhub";
import { getSessionUser } from "@/lib/session";
import { getWatchlistWithData } from "@/lib/server/watchlist";

export const metadata: Metadata = { title: "Watchlist" };
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const initialStocks = await searchStocks();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Watchlist
          </h1>
          <p className="text-sm text-muted-foreground">
            The companies you follow, with live prices.
          </p>
        </div>
        <SearchCommand
          label="Add stock"
          enableShortcut={false}
          compact={false}
          initialStocks={initialStocks}
          className="border-transparent bg-primary text-primary-foreground hover:bg-primary/85 hover:text-primary-foreground dark:border-transparent dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/85"
        />
      </header>

      <Suspense fallback={<TableSkeleton />}>
        <WatchlistSection userId={user.id} />
      </Suspense>
    </div>
  );
}

async function WatchlistSection({ userId }: { userId: string }) {
  let items: StockWithData[];
  try {
    items = await getWatchlistWithData(userId);
  } catch (e) {
    console.error("watchlist load failed:", (e as Error).message);
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        We couldn&apos;t load your watchlist. Please refresh the page.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <Star className="size-10 text-muted-foreground" aria-hidden />
        <h2 className="text-lg font-semibold">Your watchlist is empty</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Use <span className="font-medium text-foreground">Add stock</span>{" "}
          or open any stock page and press &ldquo;Add to watchlist&rdquo; to start
          tracking it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <WatchlistTable watchlist={items} />
      <section aria-labelledby="news-heading" className="flex flex-col gap-4">
        <h2 id="news-heading" className="text-xl font-semibold tracking-tight">
          News for your watchlist
        </h2>
        <Suspense fallback={<NewsSkeleton />}>
          <NewsSection symbols={items.map((i) => i.symbol)} />
        </Suspense>
      </section>
    </>
  );
}

async function NewsSection({ symbols }: { symbols: string[] }) {
  let news: MarketNewsArticle[] | null = null;
  try {
    news = await getNews(symbols);
  } catch (e) {
    console.error("watchlist news failed:", (e as Error).message);
  }

  if (news === null) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        News is unavailable right now.
      </p>
    );
  }
  return <WatchlistNews news={news} />;
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading watchlist">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton h-12 rounded-lg" />
      ))}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-40 rounded-xl" />
      ))}
    </div>
  );
}
