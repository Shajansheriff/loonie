import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { captureException } from "@/lib/logger";
import { Button } from "@/components/ui/button";

function handleError(error: Error, info: React.ErrorInfo) {
  captureException(error, {
    componentStack: info.componentStack,
  });
}

/**
 * Page-level error boundary with full-page fallback
 */
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h1>
            <p className="text-muted-foreground">We're sorry, but something unexpected happened.</p>
            {import.meta.env.DEV && (
              <pre className="mt-4 max-w-lg overflow-auto rounded bg-muted p-4 text-left text-xs">
                {(error as Error).message}
                {JSON.stringify(error, null, 2)}
              </pre>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload page
            </Button>
            <Button
              onClick={() => {
                resetErrorBoundary();
              }}
            >
              Try again
            </Button>
          </div>
        </div>
      )}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
