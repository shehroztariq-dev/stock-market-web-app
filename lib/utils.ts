import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTimeAgo = (timestamp: number) => {
  const diffInMs = Math.max(0, Date.now() - timestamp * 1000); // timestamp is in seconds
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes >= 1) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Formatted string like "$3.10T", "$900.00B", "$25.00M" or "$999,999.99"
export function formatMarketCapValue(marketCapUsd: number): string {
  if (!Number.isFinite(marketCapUsd) || marketCapUsd <= 0) return "N/A";

  if (marketCapUsd >= 1e12) return `$${(marketCapUsd / 1e12).toFixed(2)}T`; // Trillions
  if (marketCapUsd >= 1e9) return `$${(marketCapUsd / 1e9).toFixed(2)}B`; // Billions
  if (marketCapUsd >= 1e6) return `$${(marketCapUsd / 1e6).toFixed(2)}M`; // Millions
  return `$${marketCapUsd.toFixed(2)}`; // Below one million, show full USD amount
}

export const getDateRange = (days: number) => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);
  return {
    to: toDate.toISOString().split("T")[0],
    from: fromDate.toISOString().split("T")[0],
  };
};

// Get today's date range (from today to today)
export const getTodayDateRange = () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  return {
    to: todayString,
    from: todayString,
  };
};

// Calculate news per symbol based on watchlist size
export const calculateNewsDistribution = (symbolsCount: number) => {
  let itemsPerSymbol: number;
  let targetNewsCount = 6;

  if (symbolsCount < 3) {
    itemsPerSymbol = 3; // Fewer symbols, more news each
  } else if (symbolsCount === 3) {
    itemsPerSymbol = 2; // Exactly 3 symbols, 2 news each = 6 total
  } else {
    itemsPerSymbol = 1; // Many symbols, 1 news each
    targetNewsCount = 6; // Don't exceed 6 total
  }

  return { itemsPerSymbol, targetNewsCount };
};

// Check for required article fields
export const validateArticle = (article: RawNewsArticle): boolean =>
  Boolean(article.headline && article.summary && article.url && article.datetime);

// Get today's date string in YYYY-MM-DD format
export const getTodayString = () => new Date().toISOString().split("T")[0];

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

export const formatArticle = (
  article: RawNewsArticle,
  isCompanyNews: boolean,
  symbol?: string,
): MarketNewsArticle => ({
  id: article.id,
  headline: article.headline!.trim(),
  summary: truncate(article.summary!.trim(), isCompanyNews ? 200 : 150),
  source: article.source || (isCompanyNews ? "Company News" : "Market News"),
  url: article.url!,
  datetime: article.datetime!,
  image: article.image || "",
  category: isCompanyNews ? "company" : article.category || "general",
  related: isCompanyNews ? symbol! : article.related || "",
});

export const formatChangePercent = (changePercent?: number) => {
  if (changePercent === undefined || Number.isNaN(changePercent)) return "";
  const sign = changePercent > 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
};

export const getChangeColorClass = (changePercent?: number) => {
  if (!changePercent) return "text-muted-foreground";
  return changePercent > 0 ? "text-teal-400" : "text-red-500";
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
};

export const getAlertText = (alert: Alert) => {
  const condition = alert.alertType === "upper" ? ">" : "<";
  return `Price ${condition} ${formatPrice(alert.threshold)}`;
};

export const getFormattedTodayDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export const authFormSchema = (type: string) => {
  const signUp = type === "sign-up";
  return z.object({
    // sign up only
    fullName: signUp
      ? z.string().trim().min(2, "Please enter your full name").max(80)
      : z.string().optional(),
    country: signUp
      ? z.string().min(2, "Please select your country").max(50)
      : z.string().optional(),
    investmentGoals: signUp
      ? z.string().min(2, "Select an investment goal").max(50)
      : z.string().optional(),
    riskTolerance: signUp
      ? z.string().min(3, "Select a risk tolerance").max(6)
      : z.string().optional(),
    preferredIndustry: signUp
      ? z.string().min(3, "Select a preferred industry")
      : z.string().optional(),
    // both
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: signUp
      ? z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(128, "Password is too long")
      : z.string().min(1, "Password is required").max(128),
  });
};
