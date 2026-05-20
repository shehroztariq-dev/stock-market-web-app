import { useEffect, useRef } from "react";

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600,
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const configString = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent multiple initializations
    if (container.dataset.loaded === "true") return;

    // Clear and set up widget container
    container.innerHTML = `
      <div class="tradingview-widget-container__widget" 
           style="width:100%; height:${height}px;"></div>
    `;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.text = configString; // TradingView expects config in script text

    container.appendChild(script);
    container.dataset.loaded = "true";

    // Cleanup
    return () => {
      if (container) {
        container.innerHTML = "";
        delete container.dataset.loaded;
      }
    };
  }, [scriptUrl, configString, height]);

  return containerRef;
};

export default useTradingViewWidget;
