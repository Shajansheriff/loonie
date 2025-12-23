import z from "zod/v4";
import { api } from "../client";
export interface ProfileDetailsInput {
  firstName: string;
  lastName: string;
  corporationNumber: string;
  phone: string;
}

const createProfileDetailsResponseSchema = z.object({
  firstName: z.string().min(1, "Required").max(50, "Max 50 characters"),
  lastName: z.string().min(1, "Required").max(50, "Max 50 characters"),
  corporationNumber: z
    .string()
    .min(1, "Required")
    .regex(/^\d{8}$/, "Must be 8 digits"),
  phone: z.string().regex(/^\+1\d{10}$/, "Invalid format"),
});

export type ProfileDetailsResponse = z.infer<typeof createProfileDetailsResponseSchema>;

export const createProfileDetails = (profileDetails: ProfileDetailsInput) => {
  return api.post("profile-details", profileDetails, createProfileDetailsResponseSchema);
};
