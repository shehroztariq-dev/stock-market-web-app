import type { Metadata } from "next";
import TradingViewWidget from "@/components/trading-view-widget";
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";
import { getSessionUser } from "@/lib/session";
import { getFormattedTodayDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const SCRIPT = "https://s3.tradingview.com/external-embedding/embed-widget-";

export default async function Home() {
  const user = await getSessionUser();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm text-muted-foreground">
          {getFormattedTodayDate()}
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {firstName ? `Welcome back, ${firstName}` : "Market dashboard"}
        </h1>
      </header>

      <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TradingViewWidget
            title="Market overview"
            scriptUrl={`${SCRIPT}market-overview.js`}
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
            height={600}
          />
        </div>
        <div className="lg:col-span-2">
          <TradingViewWidget
            title="Stock heat map"
            scriptUrl={`${SCRIPT}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>

      <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TradingViewWidget
            title="Top stories"
            scriptUrl={`${SCRIPT}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            height={600}
          />
        </div>
        <div className="lg:col-span-2">
          <TradingViewWidget
            title="Market quotes"
            scriptUrl={`${SCRIPT}market-quotes.js`}
            config={MARKET_DATA_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>
    </div>
  );
}
