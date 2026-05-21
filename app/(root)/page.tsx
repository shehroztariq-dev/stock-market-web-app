import TradingViewWidget from "./_components/trading-view-widget";
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 min-h-screen p-10">
      <section className="grid md:grid-cols-3 w-full gap-8 ">
        <div className="md:col-span-1">
          <TradingViewWidget
            title="Market Overview"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
          />
        </div>
        <div className="md:col-span-2">
          <TradingViewWidget
            title="Stock Heat Map"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
            config={HEATMAP_WIDGET_CONFIG}
          />
        </div>
      </section>
      <section className="grid md:grid-cols-3 w-full gap-8 ">
        <div className="md:col-span-1">
          <TradingViewWidget
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
            config={TOP_STORIES_WIDGET_CONFIG}
          />
        </div>
        <div className="md:col-span-2">
          <TradingViewWidget
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
          />
        </div>
      </section>
    </div>
  );
}
