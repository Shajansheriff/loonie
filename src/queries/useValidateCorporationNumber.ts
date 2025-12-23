import { queryOptions } from "@tanstack/react-query";
import { validateCorporationNumber } from "../api/methods/validateCorporationNumber";

export const validateCorporationNumberQueryOptions = (corporationNumber: string) =>
  queryOptions({
    queryKey: ["corporationNumber", corporationNumber],
    queryFn: () => validateCorporationNumber(corporationNumber),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
