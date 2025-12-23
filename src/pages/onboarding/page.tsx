import { ArrowRightIcon } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldValidationStatus,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useCreateProfileDetails } from "@/queries/useCreateProfileDetails";
import { useQueryClient } from "@tanstack/react-query";
import { validateCorporationNumberQueryOptions } from "@/queries/useValidateCorporationNumber";

const CORPORATION_NUMBER_LENGTH = 9;
const CORPORATION_NUMBER_REGEX = new RegExp(`^\\d{${String(CORPORATION_NUMBER_LENGTH)}}$`);

const createOnboardingFormSchema = (queryClient: ReturnType<typeof useQueryClient>) =>
  z.object({
    firstName: z.string().min(1, "Required").max(50, "Max 50 characters"),
    lastName: z.string().min(1, "Required").max(50, "Max 50 characters"),
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
            // Treat API errors to make the field invalid
            return false;
          }
        },
        { message: "Invalid corporation number" }
      ),
    phone: z
      .string()
      .min(1, "Required")
      .regex(/^\+1\d{10}$/, "Invalid format"),
  });

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const onboardingFormSchema = createOnboardingFormSchema(queryClient);

  const { mutateAsync } = useCreateProfileDetails();
  const { control, handleSubmit, formState } = useForm<z.infer<typeof onboardingFormSchema>>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      corporationNumber: "",
      phone: "",
    },
    mode: "onBlur",
  });

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={(e) => {
          void handleSubmit(async (data) => {
            try {
              const result = await mutateAsync(data);
              console.log(result);
            } catch (error) {
              console.error(error);
            }
          })(e);
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
                  <FieldValidationStatus
                    show={fieldState.isDirty}
                    isValidating={fieldState.isValidating}
                    isValid={!fieldState.error}
                    isInvalid={!!fieldState.error}
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <div className="grid">
            <Button type="submit" disabled={formState.isSubmitting}>
              Submit <ArrowRightIcon />
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}


