import OnboardingPage from "./pages/onboarding/page";
import { PageErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <PageErrorBoundary>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <OnboardingPage />
      </div>
    </PageErrorBoundary>
  );
}

export default App;
