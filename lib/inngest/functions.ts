import { sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "signUpEmail",
    retries: 2,
    // triggers are now inside the config object
    triggers: [{ event: "app/user.created" }],
  },
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
        "Thanks for joining Growix. You now have the tools to track markets and make smarter moves.";

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
