"use server";

import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { getStockProfile, searchSymbols } from "@/lib/finnhub";
import { getSessionUser } from "@/lib/session";
import { getWatchlistSymbolsByUserId } from "@/lib/server/watchlist";

/**
 * Stock search used by the command palette. Requires a signed-in user so the
 * Finnhub quota can't be burned anonymously. Returns [] on any failure.
 */
export async function searchStocks(
  query?: string,
): Promise<StockWithWatchlistStatus[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];

    const trimmed = typeof query === "string" ? query.trim().slice(0, 64) : "";

    const [watched, base] = await Promise.all([
      getWatchlistSymbolsByUserId(user.id),
      trimmed ? searchByQuery(trimmed) : popularStocks(),
    ]);
    const watchedSet = new Set(watched);

    return base
      .slice(0, 15)
      .map((s) => ({ ...s, isInWatchlist: watchedSet.has(s.symbol) }));
  } catch (err) {
    console.error("Error in stock search:", (err as Error).message);
    return [];
  }
}

async function searchByQuery(q: string): Promise<Stock[]> {
  const results = await searchSymbols(q);
  const seen = new Set<string>();
  const out: Stock[] = [];
  for (const r of results) {
    const symbol = (r.symbol || "").toUpperCase();
    if (!symbol || seen.has(symbol)) continue;
    seen.add(symbol);
    out.push({
      symbol,
      name: r.description || symbol,
      exchange: "US",
      type: r.type || "Stock",
    });
  }
  return out;
}

async function popularStocks(): Promise<Stock[]> {
  const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
  const profiles = await Promise.all(top.map((s) => getStockProfile(s)));
  return top.flatMap((symbol, i) => {
    const p = profiles[i];
    if (!p?.name) return [];
    return [
      {
        symbol,
        name: p.name,
        exchange: p.exchange?.split(" ")[0] || "US",
        type: "Common Stock",
      },
    ];
  });
}
