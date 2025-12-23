import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REVENUE_RANGE_OPTIONS = [
  "Less than $100K",
  "$100K - $500K",
  "$500K - $1M",
  "$1M - $5M",
  "$5M - $10M",
  "$10M+",
] as const;

// Step 2: Business Details Schema
const businessDetailsSchema = z.object({
  businessName: z.string().min(1, "Required").max(100, "Max 100 characters"),
  firstTaxYear: z
    .string()
    .min(1, "Required")
    .regex(/^\d{4}$/, "Must be a valid year"),
  revenueRange: z.string().min(1, "Required"),
});

export type BusinessDetailsData = z.infer<typeof businessDetailsSchema>;
export function BusinessDetailsForm({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues?: BusinessDetailsData;
  onSubmit: SubmitHandler<BusinessDetailsData>;
  onBack: () => void;
}) {
  const { control, handleSubmit, formState } = useForm<BusinessDetailsData>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: defaultValues ?? {
      businessName: "",
      firstTaxYear: "",
      revenueRange: "",
    },
    mode: "onBlur",
  });

  return (
    <form
      className="grid gap-4 min-h-[310px]"
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
      <FieldGroup className="gap-1">
        <Controller
          control={control}
          name="businessName"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Business Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                placeholder="Acme Inc."
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="firstTaxYear"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>First Registered Tax Year</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2020"
                maxLength={4}
                onChange={(e) => {
                  field.onChange(e.target.value.replace(/\D/g, ""));
                }}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="revenueRange"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Revenue Range</FieldLabel>
              <Select
                {...field}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a revenue range" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeftIcon /> Back
        </Button>
        <Button type="submit" className="flex-1" disabled={formState.isSubmitting}>
          Continue <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}
