import { useMutation } from "@tanstack/react-query";
import {
  createProfileDetails,
  type ProfileDetailsInput,
  type ProfileDetailsResponse,
} from "../api/methods/createProfileDetails";
import type { ApiError } from "../api/client";

export function useCreateProfileDetails() {
  return useMutation<ProfileDetailsResponse, ApiError, ProfileDetailsInput>({
    mutationFn: (profileDetails) => createProfileDetails(profileDetails),
  });
}
