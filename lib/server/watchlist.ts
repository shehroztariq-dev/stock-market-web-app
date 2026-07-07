// Server-only data helpers (deliberately NOT "use server" so they can't be
// invoked from the browser).
import { Watchlist } from "@/db/models/watchlist.model";
import { connectToDatabase } from "@/db/mongoose";
import { getFinancials, getQuote, getStockProfile } from "@/lib/finnhub";
import { formatMarketCapValue, formatPrice, formatChangePercent } from "@/lib/utils";

export async function getWatchlistSymbolsByUserId(
  userId: string,
): Promise<string[]> {
  if (!userId) return [];
  try {
    await connectToDatabase();
    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByUserId error:", (err as Error).message);
    return [];
  }
}

export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Better Auth stores users in the "user" collection
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string }>({ email });
    if (!user) return [];
    const userId = user.id || String(user._id || "");
    return getWatchlistSymbolsByUserId(userId);
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", (err as Error).message);
    return [];
  }
}

export async function getWatchlistWithData(
  userId: string,
): Promise<StockWithData[]> {
  await connectToDatabase();
  const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

  return Promise.all(
    items.map(async (item) => {
      const symbol = String(item.symbol);
      const [quote, profile, financials] = await Promise.all([
        getQuote(symbol),
        getStockProfile(symbol),
        getFinancials(symbol),
      ]);
      const price = quote?.c && quote.c > 0 ? quote.c : undefined;
      const change = typeof quote?.dp === "number" ? quote.dp : undefined;
      const mcapMillions = profile?.marketCapitalization;
      const pe = financials?.metric?.peBasicExclExtraTTM;
      return {
        userId,
        symbol,
        company: String(item.company),
        addedAt: item.addedAt,
        currentPrice: price,
        changePercent: change,
        priceFormatted: price !== undefined ? formatPrice(price) : "—",
        changeFormatted:
          change !== undefined && change !== 0
            ? formatChangePercent(change)
            : change === 0
              ? "0.00%"
              : "—",
        marketCap: mcapMillions ? formatMarketCapValue(mcapMillions * 1e6) : "—",
        peRatio: typeof pe === "number" ? pe.toFixed(1) : "—",
      };
    }),
  );
}
