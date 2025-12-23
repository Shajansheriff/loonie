import { validateCorporationNumberQueryOptions } from "@/queries/useValidateCorporationNumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldValidationStatus,
  FormError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

const CORPORATION_NUMBER_LENGTH = 9;
const CORPORATION_NUMBER_REGEX = new RegExp(`^\\d{${String(CORPORATION_NUMBER_LENGTH)}}$`);

const createProfileSchema = (queryClient: ReturnType<typeof useQueryClient>) =>
  z.object({
    firstName: z.string().min(1, "Required").max(50, "Max 50 characters"),
    lastName: z.string().min(1, "Required").max(50, "Max 50 characters"),
    phone: z
      .string()
      .min(1, "Required")
      .regex(/^\+1\d{10}$/, "Invalid format"),
    corporationNumber: z
      .string()
      .min(1, "Required")
      .regex(CORPORATION_NUMBER_REGEX, `Must be ${String(CORPORATION_NUMBER_LENGTH)} digits`)
      .refine(
        async (value) => {
          if (!CORPORATION_NUMBER_REGEX.test(value)) {
            return true;
          }

          try {
            const result = await queryClient.fetchQuery(
              validateCorporationNumberQueryOptions(value)
            );
            return result.valid;
          } catch {
            return false;
          }
        },
        { message: "Invalid corporation number" }
      ),
  });

export type ProfileData = z.infer<ReturnType<typeof createProfileSchema>>;

export function ProfileForm({
  defaultValues,
  onSubmit,
  rootError,
}: {
  defaultValues?: ProfileData;
  onSubmit: SubmitHandler<ProfileData>;
  rootError?: string;
}) {
  const queryClient = useQueryClient();
  const profileSchema = createProfileSchema(queryClient);

  const { control, handleSubmit, formState } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues ?? {
      firstName: "",
      lastName: "",
      phone: "",
      corporationNumber: "",
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
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="text"
                  placeholder="John"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="text"
                  placeholder="Doe"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} type="text" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="corporationNumber"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Corporation Number</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    field.onChange(e.target.value.replace(/\D/g, ""));
                  }}
                />
                <FieldValidationStatus show={fieldState.isDirty} fieldState={fieldState} />
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      {rootError && <FormError className="-mt-4">{rootError}</FormError>}

      <div className="grid">
        <Button type="submit" disabled={formState.isSubmitting}>
          Continue <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}
