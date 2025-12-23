import z from "zod/v4";
import { api } from "../client";

const validateCorporationNumberResponseSchema = z.object({
  corporationNumber: z.string(),
  valid: z.boolean(),
});

export type ValidateCorporationNumberResponse = z.infer<
  typeof validateCorporationNumberResponseSchema
>;

export const validateCorporationNumber = (
  corporationNumber: string
): Promise<ValidateCorporationNumberResponse> => {
  return api.get(
    `corporation-number/${corporationNumber}`,
    validateCorporationNumberResponseSchema
  );
};
