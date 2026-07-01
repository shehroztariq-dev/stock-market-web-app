"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import BrandLogo from "./brand-logo";
import CustomInput from "./custom-input";
import { CountrySelectField } from "./country-select-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { signInWithEmail, signUpWithEmail } from "@/lib/actions/auth.actions";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";
import { authFormSchema } from "@/lib/utils";

type AuthFormProps = { type: "sign-in" | "sign-up" };

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const isSignUp = type === "sign-up";
  const [formError, setFormError] = useState<string | null>(null);
  const formSchema = authFormSchema(type);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "US",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setFormError(null);
    try {
      const result = isSignUp
        ? await signUpWithEmail(data as SignUpFormData)
        : await signInWithEmail(data as SignInFormData);

      if (!result.success) {
        setFormError(result.error);
        toast.error(isSignUp ? "Sign up failed" : "Sign in failed", {
          description: result.error,
        });
        return;
      }

      toast.success(isSignUp ? "Welcome to Growex!" : "Welcome back!");
      router.replace("/");
      router.refresh();
    } catch {
      const message = "Something went wrong. Check your connection and try again.";
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Form panel */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[48%] lg:px-16">
        <BrandLogo />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? "Tell us a little about you to personalize your market feed."
                : "Sign in to pick up where you left off."}
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {isSignUp && (
                <>
                  <CustomInput
                    control={control}
                    label="Full name"
                    name="fullName"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <CountrySelectField
                      name="country"
                      label="Country"
                      control={control}
                      error={errors.country}
                      required
                    />
                    <CustomInput
                      control={control}
                      label="Preferred industry"
                      name="preferredIndustry"
                      type="select"
                      options={PREFERRED_INDUSTRIES}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <CustomInput
                      control={control}
                      label="Risk tolerance"
                      name="riskTolerance"
                      type="select"
                      options={RISK_TOLERANCE_OPTIONS}
                    />
                    <CustomInput
                      control={control}
                      label="Investment goal"
                      name="investmentGoals"
                      type="select"
                      options={INVESTMENT_GOALS}
                    />
                  </div>
                </>
              )}

              <CustomInput
                control={control}
                label="Email"
                name="email"
                inputType="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <CustomInput
                control={control}
                label="Password"
                name="password"
                inputType="password"
                placeholder={isSignUp ? "At least 8 characters" : "Your password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full text-base font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {isSignUp ? "Creating account…" : "Signing in…"}
                  </>
                ) : isSignUp ? (
                  "Start your investment journey"
                ) : (
                  "Sign in"
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "New to Growex?"}{" "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="font-medium text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
              {isSignUp ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>

      {/* Brand panel */}
      <aside
        aria-hidden
        className="relative hidden flex-1 flex-col justify-center overflow-hidden border-l border-border bg-gray-800 p-16 lg:flex">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative max-w-md">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            Markets, made clear.
          </h2>
          <p className="mt-4 text-muted-foreground">
            One calm place to follow the stocks you care about.
          </p>
          <ul className="mt-10 space-y-6">
            {[
              ["Live charts & heatmaps", "Real-time market overview powered by TradingView."],
              ["A watchlist that's yours", "Save the companies you follow and see price, change and valuation at a glance."],
              ["A daily news digest", "AI-summarized headlines for your watchlist, in your inbox."],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-4">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
