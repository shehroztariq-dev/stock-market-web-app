"use client";

import { useState } from "react";
import { Control, Controller, FieldPath } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import z from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authFormSchema } from "@/lib/utils";

type FormValues = z.infer<ReturnType<typeof authFormSchema>>;

type Option = { value: string; label: string };

interface CustomInputProps {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
  placeholder?: string;
  /** "input" | "select" */
  type?: "input" | "select";
  /** HTML input type (text, email, password, tel, etc.) */
  inputType?: string;
  autoComplete?: string;
  options?: readonly Option[];
  disabled?: boolean;
}

export default function CustomInput({
  control,
  name,
  label,
  placeholder,
  type = "input",
  inputType = "text",
  autoComplete = "off",
  options,
  disabled = false,
}: CustomInputProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = inputType === "password";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          {type === "input" && (
            <div className="relative">
              <Input
                {...field}
                value={field.value ?? ""}
                id={field.name}
                type={isPassword && revealed ? "text" : inputType}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? `${field.name}-error` : undefined
                }
                autoComplete={autoComplete}
                placeholder={placeholder}
                disabled={disabled}
                className={isPassword ? "h-10 pr-10" : "h-10"}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setRevealed((v) => !v)}
                  aria-label={revealed ? "Hide password" : "Show password"}
                  aria-pressed={revealed}
                  className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                  {revealed ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              )}
            </div>
          )}

          {type === "select" && (
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={disabled}>
              <SelectTrigger id={field.name} className="h-10 w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {fieldState.invalid && fieldState.error && (
            <div id={`${field.name}-error`}>
              <FieldError errors={[fieldState.error]} />
            </div>
          )}
        </Field>
      )}
    />
  );
}
