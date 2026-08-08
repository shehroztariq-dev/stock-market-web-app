// lib/inngest/client.ts

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "growex",
  ai: { gemini: { apiKey: process.env.GEMINI_API_KEY! } },
});
