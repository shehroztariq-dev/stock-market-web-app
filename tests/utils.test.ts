import { describe, expect, it, vi, afterEach } from "vitest";
import {
  authFormSchema,
  formatArticle,
  formatChangePercent,
  formatMarketCapValue,
  formatTimeAgo,
  getChangeColorClass,
  validateArticle,
} from "@/lib/utils";

afterEach(() => vi.useRealTimers());

describe("authFormSchema", () => {
  const signUp = authFormSchema("sign-up");
  const signIn = authFormSchema("sign-in");
  const valid = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "supersecret",
    country: "US",
    investmentGoals: "Growth",
    riskTolerance: "Medium",
    preferredIndustry: "Technology",
  };

  it("accepts a valid sign-up", () => {
    expect(signUp.safeParse(valid).success).toBe(true);
  });
  it("rejects malformed emails (previously accepted any string)", () => {
    expect(signUp.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(signIn.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
  it("enforces an 8 char password on sign-up only", () => {
    expect(signUp.safeParse({ ...valid, password: "short" }).success).toBe(false);
    expect(signIn.safeParse({ email: "a@b.co", password: "short" }).success).toBe(true);
  });
  it("does not require profile fields on sign-in", () => {
    expect(signIn.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});

describe("formatting helpers", () => {
  it("formats market caps", () => {
    expect(formatMarketCapValue(3.1e12)).toBe("$3.10T");
    expect(formatMarketCapValue(9e8)).toBe("$900.00M");
    expect(formatMarketCapValue(0)).toBe("N/A");
  });
  it("formats change percent incl. zero", () => {
    expect(formatChangePercent(1.234)).toBe("+1.23%");
    expect(formatChangePercent(-0.5)).toBe("-0.50%");
    expect(formatChangePercent(0)).toBe("0.00%");
    expect(formatChangePercent(undefined)).toBe("");
  });
  it("colors changes", () => {
    expect(getChangeColorClass(2)).toBe("text-teal-400");
    expect(getChangeColorClass(-2)).toBe("text-red-500");
  });
  it("formats relative time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00Z"));
    const now = Math.floor(Date.now() / 1000);
    expect(formatTimeAgo(now - 10)).toBe("Just now");
    expect(formatTimeAgo(now - 3 * 60)).toBe("3 minutes ago");
    expect(formatTimeAgo(now - 2 * 3600)).toBe("2 hours ago");
    expect(formatTimeAgo(now - 30 * 3600)).toBe("1 day ago");
    expect(formatTimeAgo(now + 500)).toBe("Just now"); // clock skew
  });
});

describe("news helpers", () => {
  const raw = {
    id: 7,
    headline: " Headline ",
    summary: "Short",
    url: "https://x.test/a",
    datetime: 1,
  };
  it("validates required fields", () => {
    expect(validateArticle(raw)).toBe(true);
    expect(validateArticle({ ...raw, url: undefined })).toBe(false);
  });
  it("only adds an ellipsis when truncating and keeps stable ids", () => {
    const short = formatArticle(raw, true, "AAPL");
    expect(short.summary).toBe("Short");
    expect(short.id).toBe(7);
    const long = formatArticle({ ...raw, summary: "x".repeat(400) }, false);
    expect(long.summary.endsWith("…")).toBe(true);
    expect(long.summary.length).toBeLessThanOrEqual(151);
  });
});
