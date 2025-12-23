import z from "zod/v4"
import { api } from "../client"

const createProfileDetailsRequestSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
    corporationNumber: z.string().length(8, "Corporation number must be 8 characters long"),
    phone: z.string().regex(/^\+1\d{10}$/, "Invalid phone number"), // should be valid canadian phone number (10 digits) and starts with +1
})

export const createProfileDetails = (profileDetails: z.infer<typeof createProfileDetailsRequestSchema>) => {
    return api.post('/profile-details', profileDetails, createProfileDetailsRequestSchema)
}