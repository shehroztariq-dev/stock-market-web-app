// lib/inngest/functions.ts

import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";

import { getWatchlistSymbolsByEmail } from "@/lib/server/watchlist";
import { getNews } from "@/lib/finnhub";
import { getFormattedTodayDate } from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
    retries: 2,
    triggers: [{ event: "app/user.created" }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: any) => {
    // Build user profile for the prompt
    const userProfile = `
- Country: ${event.data.country || "Not specified"}
- Investment goals: ${event.data.investmentGoals || "Not specified"}
- Risk tolerance: ${event.data.riskTolerance || "Not specified"}
- Preferred industry: ${event.data.preferredIndustry || "Not specified"}
    `.trim();

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile,
    );

    // Generate personalized welcome text using Gemini
    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];

      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Growex. You now have the tools to track markets and make smarter moves.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
      success: true,
      message: "Welcome email processed successfully",
    };
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-use-summary",
    triggers: [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ step }: any) => {
    // Step #1: Get all users for news delivery
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);
    if (!users || users.length === 0)
      return { success: false, message: "No users found for news email" };

    // Step #2: Fetch personalized news for each user
    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{
        user: UserForNewsEmail;
        articles: MarketNewsArticle[];
      }> = [];
      for (const user of users as UserForNewsEmail[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          // Enforce max 6 articles per user
          articles = (articles || []).slice(0, 6);
          // If still empty, fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });

    // Step #3: Summarize these news via AI for each user
    const userNewsSummaries: {
      user: UserForNewsEmail;
      newsContent: string | null;
    }[] = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2),
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news.";

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error("Failed to summarize news for : ", user.email, e);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }
    // Step #4: Send Email
    await step.run("send-news-emails", async () => {
      // One bad address must not stop everyone else's email.
      const outcomes = await Promise.allSettled(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return;
          await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        }),
      );
      const failed = outcomes.filter((o) => o.status === "rejected").length;
      if (failed > 0) console.error(`daily-news: ${failed} email(s) failed`);
    });

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  },
);
