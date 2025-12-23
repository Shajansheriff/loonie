import { ArrowRightIcon } from "lucide-react"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
  } from "@/components/ui/field"
  import { Input } from "@/components/ui/input"
  import { z } from "zod"
  import { Controller, useForm } from "react-hook-form"
  import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
  
  const registerFormSchema = z.object({
    firstName: z.string().min(1, "Required").max(50, "Max 50 characters"),
    lastName: z.string().min(1, "Required").max(50, "Max 50 characters"),
    corporationNumber: z.string().min(1, "Required").regex(/^\d{8}$/, "Must be 8 digits"),
    phone: z.string().regex(/^\+1\d{10}$/, "Invalid format"),
})
  export default function RegisterPage() {
    const { control, handleSubmit } = useForm<z.infer<typeof registerFormSchema>>({
      resolver: zodResolver(registerFormSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        corporationNumber: "",
        phone: "",
      },
    })
    const onSubmit = (data: z.infer<typeof registerFormSchema>) => {
      console.log(data)
    }
    return (
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="gap-1">
            <div className="grid grid-cols-2 gap-4">
                <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                    <Field>
              <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} type="text" placeholder="John" />
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
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} type="text" placeholder="Doe" />
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
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} type="text" placeholder="+1234567890" />
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
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="12345678"
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
            )}
            /> 
            <div className="grid">

<Button type="submit">Submit <ArrowRightIcon /></Button>
    </div>
            </FieldGroup>
            
        </form>
      </div>
    )
  }
  