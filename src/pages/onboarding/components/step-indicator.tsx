import { cn } from "@/lib/utils";

export function StepIndicator({
  steps,
  currentStep,
}: {
  steps: { id: number; title: string }[];
  currentStep: number;
}) {
  return (
    <div className="mb-6 grid gap-3 ">
      <div className="flex items-center justify-between mb-2 w-full">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn("flex items-center", index < steps.length - 1 ? "grow" : "")}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full text-sm font-medium transition-colors ${
                currentStep >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.id}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-full h-0.5 mx-2 transition-colors ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Step {currentStep}: {steps.find((s) => s.id === currentStep)?.title}
      </p>
    </div>
  );
}
