import nodemailer from "nodemailer";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// AI output is rendered as HTML: drop code fences and anything executable.
const sanitizeAiHtml = (value: string) =>
  value
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/```\s*$/, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "");

// Use replacer functions so "$&" / "$1" in user or AI text is never interpreted.
const fill = (template: string, key: string, value: string) =>
  template.split(`{{${key}}}`).join(value);

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = fill(
    fill(WELCOME_EMAIL_TEMPLATE, "name", escapeHtml(name)),
    "intro",
    sanitizeAiHtml(intro),
  );

  const mailOptions = {
    from: `"Growex" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: "Welcome to Growex - your stock market toolkit is ready!",
    text: "Thanks for joining Growex",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = fill(
    fill(NEWS_SUMMARY_EMAIL_TEMPLATE, "date", escapeHtml(date)),
    "newsContent",
    sanitizeAiHtml(newsContent),
  );

  const mailOptions = {
    from: `"Growex News" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Growex`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
