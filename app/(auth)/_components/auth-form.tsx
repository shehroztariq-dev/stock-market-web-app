"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import BrandLogo from "./brand-logo";
import CustomInput from "./custom-input";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import z from "zod";
import { authFormSchema } from "@/lib/utils";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";
import { CountrySelectField } from "./country-select-field";
import { signInWithEmail, signUpWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// import { authClient } from "@/lib/auth/auth-client";
// import { redirect } from "next/navigation";

type AuthFormProps = {
  type: "sign-in" | "sign-up";
};

// AuthForm.tsx
export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // const { data: user, isPending } = authClient.useSession(); // 👈 destructure
  const formSchema = authFormSchema(type);
  const {
    register,
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
    setIsLoading(true);
    try {
      console.log(data);
      if (type === "sign-up") {
        const result = await signUpWithEmail(data);
        if (result.success) router.push("/");
      }
      if (type === "sign-in") {
        const result = await signInWithEmail(data);
        if (result.success) router.push("/");
      }
    } catch (e) {
      console.log(e);
      toast.error("Sign up failed", {
        description:
          e instanceof Error ? e.message : "Failed to create an account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center mx-10">
      <div className="flex flex-col gap-4 w-full max-w-xl">
        <header className="flex flex-col gap-4">
          <BrandLogo />
          <div>
            <h1 className="text-lg font-bold">
              {type === "sign-in" ? "Sign In" : "Sign Up"}
            </h1>
            <p className="text-[14px] font-normal text-gray-600">
              {"Please enter your details"}
            </p>
          </div>
        </header>

        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {type === "sign-up" && (
                <>
                  <CustomInput
                    control={control}
                    label="Full Name"
                    name="fullName"
                    placeholder="ex:John Doe"
                  />
                  <CountrySelectField
                    name="country"
                    label="Country"
                    control={control}
                    error={errors.country}
                    required
                  />
                  <CustomInput
                    control={control}
                    label="Risk Tolerance"
                    name="riskTolerance"
                    type="select"
                    options={RISK_TOLERANCE_OPTIONS}
                  />
                  <CustomInput
                    control={control}
                    label="Investment Goal"
                    name="investmentGoals"
                    type="select"
                    options={INVESTMENT_GOALS}
                  />
                  <CustomInput
                    control={control}
                    label="Preffered Industry"
                    name="preferredIndustry"
                    type="select"
                    options={PREFERRED_INDUSTRIES}
                  />
                </>
              )}
              {/* Email Input */}
              <CustomInput
                control={control}
                label="Email"
                name="email"
                placeholder="Enter your email"
              />
              {/* Password Input */}
              <CustomInput
                control={control}
                label="Password"
                name="password"
                placeholder="Enter your password"
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" />
                    Loading...
                  </span>
                ) : type === "sign-in" ? (
                  "Sign In"
                ) : (
                  "Start Your Investment Journey"
                )}
              </Button>
            </FieldGroup>
          </form>
        </>

        <footer className="flex items-center justify-center gap-1">
          <p className="text-sm text-gray-600 font-normal">
            {type === "sign-in"
              ? "Don't have an account?"
              : "Already have an account"}
          </p>
          <Link
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
            className="text-sm font-normal hover:underline">
            {type === "sign-in" ? "Create Account" : "Sign In"}
          </Link>
        </footer>
      </div>
    </div>
  );
}
