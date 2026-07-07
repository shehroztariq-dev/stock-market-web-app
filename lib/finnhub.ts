// Server-side Finnhub helpers. NOT a "use server" module on purpose: nothing in
// here may be callable from the browser (the API key and arbitrary-URL fetch
// helper must stay private).
import { formatArticle, getDateRange, validateArticle } from "@/lib/utils";

export const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export const getFinnhubToken = () => process.env.FINNHUB_API_KEY ?? "";

export async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number,
): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } =
    revalidateSeconds
      ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" };

  const res = await fetch(url, options);
  if (!res.ok) {
    // Never include the URL: it carries the API token.
    throw new Error(`Finnhub request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

type FinnhubProfile = {
  name?: string;
  ticker?: string;
  exchange?: string;
  logo?: string;
  finnhubIndustry?: string;
  marketCapitalization?: number;
  weburl?: string;
};

export async function getStockProfile(
  symbol: string,
): Promise<FinnhubProfile | null> {
  const token = getFinnhubToken();
  if (!token) return null;
  try {
    const profile = await fetchJSON<FinnhubProfile>(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`,
      3600,
    );
    return profile && Object.keys(profile).length > 0 ? profile : null;
  } catch (e) {
    console.error("getStockProfile error for", symbol, (e as Error).message);
    return null;
  }
}

export async function getQuote(symbol: string): Promise<QuoteData | null> {
  const token = getFinnhubToken();
  if (!token) return null;
  try {
    return await fetchJSON<QuoteData>(
      `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
      60,
    );
  } catch (e) {
    console.error("getQuote error for", symbol, (e as Error).message);
    return null;
  }
}

export async function getFinancials(
  symbol: string,
): Promise<FinancialsData | null> {
  const token = getFinnhubToken();
  if (!token) return null;
  try {
    return await fetchJSON<FinancialsData>(
      `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`,
      3600,
    );
  } catch (e) {
    console.error("getFinancials error for", symbol, (e as Error).message);
    return null;
  }
}

export async function searchSymbols(
  query: string,
): Promise<FinnhubSearchResult[]> {
  const token = getFinnhubToken();
  if (!token) return [];
  const data = await fetchJSON<FinnhubSearchResponse>(
    `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${token}`,
    1800,
  );
  return Array.isArray(data?.result) ? data.result : [];
}

const MAX_ARTICLES = 6;

/**
 * Company news for the given symbols (round-robin) or general market news.
 * Throws when the API key is missing or the general feed fails.
 */
export async function getNews(
  symbols?: string[],
): Promise<MarketNewsArticle[]> {
  const token = getFinnhubToken();
  if (!token) throw new Error("FINNHUB_API_KEY is not configured");

  const range = getDateRange(5);
  const cleanSymbols = Array.from(
    new Set(
      (symbols || [])
        .map((s) => s?.trim().toUpperCase())
        .filter((s): s is string => Boolean(s)),
    ),
  ).slice(0, 20);

  if (cleanSymbols.length > 0) {
    const perSymbol: Record<string, RawNewsArticle[]> = {};
    await Promise.all(
      cleanSymbols.map(async (sym) => {
        try {
          const articles = await fetchJSON<RawNewsArticle[]>(
            `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`,
            300,
          );
          perSymbol[sym] = (articles || []).filter(validateArticle);
        } catch (e) {
          console.error("company news failed for", sym, (e as Error).message);
          perSymbol[sym] = [];
        }
      }),
    );

    const collected: MarketNewsArticle[] = [];
    const seenUrls = new Set<string>();
    outer: for (let round = 0; round < MAX_ARTICLES * 3; round++) {
      let progressed = false;
      for (const sym of cleanSymbols) {
        const article = perSymbol[sym]?.shift();
        if (!article) continue;
        progressed = true;
        if (seenUrls.has(article.url!)) continue;
        seenUrls.add(article.url!);
        collected.push(formatArticle(article, true, sym));
        if (collected.length >= MAX_ARTICLES) break outer;
      }
      if (!progressed) break;
    }

    if (collected.length > 0) {
      collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
      return collected;
    }
  }

  const general = await fetchJSON<RawNewsArticle[]>(
    `${FINNHUB_BASE_URL}/news?category=general&token=${token}`,
    300,
  );

  const seen = new Set<string>();
  const out: MarketNewsArticle[] = [];
  for (const art of general || []) {
    if (!validateArticle(art)) continue;
    const key = art.url!;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(formatArticle(art, false));
    if (out.length >= MAX_ARTICLES) break;
  }
  return out;
}
