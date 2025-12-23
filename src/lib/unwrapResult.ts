import type { ResultAsync } from "neverthrow";


export function unwrapResultAsync<T, E>(result: ResultAsync<T, E>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    }
  );
}

export type UnWrapReturnType<T> = Promise<T>
