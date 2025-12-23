import type { ResultAsync } from "neverthrow";


export function unwrapResultAsync<T, E>(result: ResultAsync<T, E>): Promise<T> {
  return result.match(
    (value) => value,
    (error: E) => {
      // Wrap non-Error objects in Error for strict ESLint compliance
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(typeof error === "object" && error !== null && "message" in error 
        ? String((error as { message: unknown }).message) 
        : String(error), 
        { cause: error }
      );
    }
  );
}

export type UnWrapReturnType<T> = Promise<T>
