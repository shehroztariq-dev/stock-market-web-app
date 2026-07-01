import { ExternalLink } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function WatchlistNews({ news }: WatchlistNewsProps) {
  if (!news || news.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No recent news for your watchlist.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {news.map((article) => (
        <li key={`${article.id}-${article.url}`}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {article.related && article.category === "company" && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-teal-400">
                  {article.related}
                </span>
              )}
              <span className="truncate">{article.source}</span>
              <span aria-hidden>·</span>
              <time>{formatTimeAgo(article.datetime)}</time>
            </div>
            <h3 className="line-clamp-2 font-semibold leading-snug text-foreground group-hover:text-primary">
              {article.headline}
            </h3>
            <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
              {article.summary}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              Read more <ExternalLink className="size-3" />
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
