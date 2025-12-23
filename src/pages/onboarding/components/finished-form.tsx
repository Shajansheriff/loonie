import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export function FinishedForm({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  return (
    <div className="flex flex-col justify-between  min-h-[310px]">
      <div className="py-6 grid gap-2">
        <h1 className="text-2xl font-bold text-center">Congratulations!</h1>
        <p className="text-muted-foreground text-center">
          You have successfully completed the onboarding process.
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeftIcon /> Back
        </Button>
        <Button type="button" className="flex-1" onClick={onFinish}>
          Go to dashboard <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
