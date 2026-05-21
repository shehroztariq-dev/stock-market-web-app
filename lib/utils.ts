import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const authFormSchema = (type: string) =>
  z.object({
    // sign up
    fullName: type === "sign-in" ? z.string().optional() : z.string().min(3),
    country: type === "sign-in" ? z.string().optional() : z.string().max(50),
    city: type === "sign-in" ? z.string().optional() : z.string().max(50),
    investmentGoals:
      type === "sign-in" ? z.string().optional() : z.string().min(2).max(2),
    riskTolerance:
      type === "sign-in" ? z.string().optional() : z.string().min(3).max(6),
    preferredIndustry:
      type === "sign-in" ? z.string().optional() : z.string().min(3),
    // both
    email: z.string(),
    password: z.string().min(8),
  });
