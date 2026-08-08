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
import { Control, Controller, FieldPath } from "react-hook-form";
import z from "zod";

const formSchema = authFormSchema("sign-up");

type Option = {
  value: string;
  label: string;
};

interface CustomInputProps {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder?: string;
  /** "input" | "select" */
  type?: "input" | "select";
  /** HTML input type (text, email, password, tel, etc.) */
  inputType?: string;
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
  options,
  disabled = false,
}: CustomInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          {type === "input" && (
            <Input
              {...field}
              id={field.name}
              type={inputType}
              aria-invalid={fieldState.invalid}
              autoComplete={inputType === "password" ? "new-password" : "off"}
              placeholder={placeholder}
              disabled={disabled}
            />
          )}

          {type === "select" && (
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              disabled={disabled}>
              <SelectTrigger>
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
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}
