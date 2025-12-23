import { queryOptions } from "@tanstack/react-query";
import {
  validateCorporationNumber,
  type ValidateCorporationNumberResponse,
} from "../api/methods/validateCorporationNumber";
import type { ApiError } from "../api/client";

export const validateCorporationNumberQueryOptions = (corporationNumber: string) =>
  queryOptions<ValidateCorporationNumberResponse, ApiError>({
    queryKey: ["corporationNumber", corporationNumber],
    queryFn: () => validateCorporationNumber(corporationNumber),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
