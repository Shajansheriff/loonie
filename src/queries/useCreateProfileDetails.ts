import { useMutation } from "@tanstack/react-query";
import {
  createProfileDetails,
  type ProfileDetailsInput,
} from "../api/methods/createProfileDetails";
import type { ApiError } from "../api/client";

export function useCreateProfileDetails() {
  return useMutation<undefined, ApiError, ProfileDetailsInput>({
    mutationFn: async (profileDetails) => {
      await createProfileDetails(profileDetails);
      return undefined;
    },
  });
}
