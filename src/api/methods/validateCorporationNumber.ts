import z from "zod/v4";
import { api } from "../client";

const validateCorporationNumberResponseSchema = z.object({
  corporationNumber: z.string(),
  valid: z.boolean(),
});

export const validateCorporationNumber = (corporationNumber: string) => {
  return api.get(
    `corporation-number/${corporationNumber}`,
    validateCorporationNumberResponseSchema
  );
};
