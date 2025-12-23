import { queryOptions } from "@tanstack/react-query";
import { validateCorporationNumber } from "../api/methods/validateCorporationNumber";
import { unwrapResultAsync } from "../lib/unwrapResult";


export const validateCorporationNumberQueryOptions = (corporationNumber: string) => queryOptions({
  queryKey: ["corporationNumber", corporationNumber],
  queryFn: async () => unwrapResultAsync(validateCorporationNumber(corporationNumber)),
  staleTime: 1000 * 60 * 5,
  retry: false, 
});
