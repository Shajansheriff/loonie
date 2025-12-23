import type { ResultAsync } from "neverthrow";

export type InferOk<T> = T extends (...args: never[]) => ResultAsync<infer U, unknown>
  ? U
  : T extends ResultAsync<infer U, unknown>
    ? U
    : never;

export type InferErr<T> = T extends (...args: never[]) => ResultAsync<unknown, infer E>
  ? E
  : T extends ResultAsync<unknown, infer E>
    ? E
    : never;

export type InferInput<T> = T extends (input: infer I) => ResultAsync<unknown, unknown> ? I : never;
