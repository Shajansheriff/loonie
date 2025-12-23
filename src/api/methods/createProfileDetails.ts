import z from "zod/v4"
import { api } from "../client"

const createProfileDetailsRequestSchema = z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    corporationNumber: z.string().length(8),
    phone: z.string().regex(/^\+1\d{10}$/), // should be valid canadian phone number (10 digits) and starts with +1
})

export const createProfileDetails = (profileDetails: z.infer<typeof createProfileDetailsRequestSchema>) => {
    return api.post('/profile-details', profileDetails, createProfileDetailsRequestSchema)
}