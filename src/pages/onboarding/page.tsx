import { useState } from "react";
import { HttpError } from "@/api/client";
import { z } from "zod";
import { type SubmitHandler } from "react-hook-form";
import { useCreateProfileDetails } from "@/queries/useCreateProfileDetails";
import { logger, captureException } from "@/lib/logger";
import { StepIndicator } from "./components/step-indicator";
import { ProfileForm, type ProfileData } from "./components/profile-form";
import { BusinessDetailsForm, type BusinessDetailsData } from "./components/business-details-form";
import { FinishedForm } from "./components/finished-form";

const STEPS = [
  { id: 1, title: "Profile" },
  { id: 2, title: "Business Details" },
  { id: 3, title: "Complete" },
];

type Step = (typeof STEPS)[number]["id"];

// Step data cache keys
const STEP_KEYS = z.enum(["profile", "businessDetails", "complete"]);

// Type-safe cache for step data
interface StepDataMap {
  [STEP_KEYS.enum.profile]: ProfileData;
  [STEP_KEYS.enum.businessDetails]: BusinessDetailsData;
  [STEP_KEYS.enum.complete]: boolean;
}

type StepDataCache = {
  [K in z.infer<typeof STEP_KEYS>]?: StepDataMap[K];
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [stepCache, setStepCache] = useState<StepDataCache>({});
  const [rootError, setRootError] = useState<string | undefined>();

  const { mutateAsync } = useCreateProfileDetails();

  const setCacheValue = <K extends z.infer<typeof STEP_KEYS>>(key: K, value: StepDataMap[K]) => {
    setStepCache((prev) => ({ ...prev, [key]: value }));
  };

  const getCacheValue = <K extends z.infer<typeof STEP_KEYS>>(
    key: K
  ): StepDataMap[K] | undefined => {
    return stepCache[key] as StepDataMap[K] | undefined;
  };

  const handleProfileSubmit: SubmitHandler<ProfileData> = async (data) => {
    setRootError(undefined);

    try {
      await mutateAsync(data);
      logger.info("Profile created successfully", { firstName: data.firstName });

      setCacheValue(STEP_KEYS.enum.profile, data);
      setCurrentStep(2);
    } catch (error) {
      if (error instanceof HttpError) {
        logger.warn("Profile creation failed", {
          status: error.status,
          message: error.message,
          body: error.body,
        });
        setRootError(error.message);
      } else {
        captureException(error, { action: "createProfile" });
        setRootError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleBusinessDetailsSubmit: SubmitHandler<BusinessDetailsData> = (data) => {
    setCacheValue(STEP_KEYS.enum.businessDetails, data);
    setCurrentStep(3);
  };

  const handleFinish = () => {
    logger.info("Onboarding complete", { cache: stepCache });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
  };

  return (
    <main role="main" className="w-full max-w-md">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {currentStep === 1 && (
        <ProfileForm
          defaultValues={getCacheValue(STEP_KEYS.enum.profile)}
          onSubmit={(data) => void handleProfileSubmit(data)}
          rootError={rootError}
        />
      )}

      {currentStep === 2 && (
        <BusinessDetailsForm
          defaultValues={getCacheValue(STEP_KEYS.enum.businessDetails)}
          onSubmit={handleBusinessDetailsSubmit}
          onBack={handleBackToStep1}
        />
      )}

      {currentStep === 3 && <FinishedForm onBack={handleBackToStep2} onFinish={handleFinish} />}
    </main>
  );
}
