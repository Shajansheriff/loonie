import { useMutation } from "@tanstack/react-query";
import { createProfileDetails } from "../api/methods/createProfileDetails";
import { unwrapResultAsync } from "../lib/unwrapResult";
import type { InferOk, InferErr, InferInput } from "../lib/result-types";

export function useCreateProfileDetails() {
  return useMutation<
    InferOk<typeof createProfileDetails>,
    InferErr<typeof createProfileDetails>,
    InferInput<typeof createProfileDetails>
  >({
    mutationFn: (profileDetails) => unwrapResultAsync(createProfileDetails(profileDetails)),
  });
}
