"use client";

import { memo } from "react";
import { RefreshCw } from "lucide-react";
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

function TradingViewWidget({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) {
  const { containerRef, status, retry } = useTradingViewWidget(
    scriptUrl,
    config,
    height,
  );

  return (
    <section className="w-full" aria-label={title}>
      {title && (
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      )}
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-gray-800"
        style={{ minHeight: height }}>
        <div
          className={cn("tradingview-widget-container", className)}
          ref={containerRef}
        />
        {status === "loading" && (
          <div
            aria-hidden
            className="skeleton pointer-events-none absolute inset-0"
          />
        )}
        {status === "error" && (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-800 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              This widget couldn&apos;t load. Check your connection or ad
              blocker and try again.
            </p>
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw /> Retry
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(TradingViewWidget);
