"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { inngest } from "@/lib/inngest/client";
import { getAuth } from "../auth";

type AuthResult = { success: true } | { success: false; error: string };

const messageFrom = (e: unknown, fallback: string) => {
  if (e instanceof APIError && e.message) return e.message;
  return fallback;
};

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData): Promise<AuthResult> => {
  try {
    const auth = await getAuth();
    await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });
  } catch (e) {
    console.error("Sign up failed:", (e as Error).message);
    return {
      success: false,
      error: messageFrom(e, "We couldn't create your account. Please try again."),
    };
  }

  // The account exists at this point; a failure to queue the welcome email
  // must not make sign-up look like it failed.
  try {
    await inngest.send({
      name: "app/user.created",
      data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry },
    });
  } catch (e) {
    console.error("Failed to queue welcome email:", (e as Error).message);
  }

  return { success: true };
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInFormData): Promise<AuthResult> => {
  try {
    const auth = await getAuth();
    await auth.api.signInEmail({ body: { email, password } });
    return { success: true };
  } catch (e) {
    console.error("Sign in failed:", (e as Error).message);
    return {
      success: false,
      error: messageFrom(e, "We couldn't sign you in. Please try again."),
    };
  }
};

export const signOut = async (): Promise<AuthResult> => {
  try {
    const auth = await getAuth();
    await auth.api.signOut({ headers: await headers() });
    return { success: true };
  } catch (e) {
    console.error("Sign out failed:", (e as Error).message);
    return { success: false, error: "Sign out failed" };
  }
};
