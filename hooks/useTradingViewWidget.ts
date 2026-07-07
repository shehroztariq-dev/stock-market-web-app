"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WidgetStatus = "loading" | "ready" | "error";

const LOAD_TIMEOUT_MS = 15000;

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600,
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<WidgetStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const configString = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setStatus("loading");
    container.innerHTML = `<div class="tradingview-widget-container__widget" style="width:100%;height:${height}px;"></div>`;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.text = configString; // TradingView reads its config from the script body
    script.onerror = () => setStatus("error");
    container.appendChild(script);

    // The widget injects an <iframe>; consider it ready once that iframe loads.
    const observer = new MutationObserver(() => {
      const iframe = container.querySelector("iframe");
      if (iframe) {
        observer.disconnect();
        iframe.addEventListener("load", () => setStatus("ready"), { once: true });
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const timeout = window.setTimeout(() => {
      setStatus((s) => (s === "loading" ? "error" : s));
    }, LOAD_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      container.innerHTML = "";
    };
  }, [scriptUrl, configString, height, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { containerRef, status, retry };
};

export default useTradingViewWidget;
