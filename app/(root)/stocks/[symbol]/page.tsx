import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import WatchlistButton from "@/components/watchlist-button";
import TradingViewWidget from "@/components/trading-view-widget";
import { getStockProfile } from "@/lib/finnhub";
import { getSessionUser } from "@/lib/session";
import { getWatchlistSymbolsByUserId } from "@/lib/server/watchlist";

const SYMBOL_PATTERN = /^[A-Z0-9.\-^:]{1,15}$/;

const parseSymbol = (raw: string) => {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const symbol = decoded.trim().toUpperCase();
  return SYMBOL_PATTERN.test(symbol) ? symbol : null;
};

export async function generateMetadata({
  params,
}: StockDetailsPageProps): Promise<Metadata> {
  const symbol = parseSymbol((await params).symbol);
  return { title: symbol ?? "Stock" };
}

const SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const symbol = parseSymbol((await params).symbol);
  if (!symbol) notFound();

  const user = await getSessionUser();
  const [profile, watched] = await Promise.all([
    getStockProfile(symbol),
    user ? getWatchlistSymbolsByUserId(user.id) : Promise.resolve([]),
  ]);
  const company = profile?.name || symbol;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">
              {company}
            </h1>
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {symbol}
            </span>
          </div>
          {(profile?.exchange || profile?.finnhubIndustry) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[profile.finnhubIndustry, profile.exchange]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <WatchlistButton
          symbol={symbol}
          company={company}
          isInWatchlist={watched.includes(symbol)}
        />
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${SCRIPT}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />
          <TradingViewWidget
            scriptUrl={`${SCRIPT}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            className="custom-chart"
            height={600}
          />
          <TradingViewWidget
            scriptUrl={`${SCRIPT}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol)}
            className="custom-chart"
            height={600}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${SCRIPT}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />
          <TradingViewWidget
            scriptUrl={`${SCRIPT}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />
          <TradingViewWidget
            scriptUrl={`${SCRIPT}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />
        </div>
      </section>
    </div>
  );
}
