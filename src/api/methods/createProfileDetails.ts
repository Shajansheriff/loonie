import { api } from "../client";

export interface ProfileDetailsInput {
  firstName: string;
  lastName: string;
  corporationNumber: string;
  phone: string;
}

export const createProfileDetails = async (profileDetails: ProfileDetailsInput): Promise<void> => {
  await api.postVoid("profile-details", profileDetails);
};
