import ky, { type Options } from "ky";
import { ok, err, ResultAsync, type Result } from "neverthrow";
import { type ZodType } from "zod/v4";

export class NetworkError {
  readonly _tag = "NetworkError" as const;
  readonly cause: Error;

  constructor(cause: Error) {
    this.cause = cause;
  }
}

export class HttpError {
  readonly _tag = "HttpError" as const;
  readonly status: number;
  readonly message: string;
  readonly body?: unknown;
  readonly cause?: Error;

  constructor(status: number, message: string, body?: unknown, cause?: Error) {
    this.status = status;
    this.message = message;
    this.body = body;
    this.cause = cause;
  }
}

export class ValidationError {
  readonly _tag = "ValidationError" as const;
  readonly issues: Array<{ path: string; message: string }>;
  readonly cause?: unknown;

  constructor(issues: Array<{ path: string; message: string }>, cause?: unknown) {
    this.issues = issues;
    this.cause = cause;
  }
}

export class UnknownError {
  readonly _tag = "UnknownError" as const;
  readonly message: string;
  readonly cause: unknown;

  constructor(cause: unknown) {
    this.cause = cause;
    this.message = cause instanceof Error ? cause.message : String(cause);
  }
}

export type ApiError = NetworkError | HttpError | ValidationError | UnknownError;

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const client = ky.create({
  prefixUrl: BASE_URL,
  timeout: 30000,
});

async function request<T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  schema: ZodType<T>,
  payload: unknown,
  options?: Options
): Promise<Result<T, ApiError>> {
  try {
    const res = client[method](url, {
      ...options,
      ...(payload !== undefined && { json: payload }),
    });

    // TODO: improve error handling here
    const response = await res.json();
    const parsed = schema.safeParse(response);

    if (!parsed.success) {
      return err(
        new ValidationError(
          parsed.error.issues.map((i) => ({
            path: i.path.map(String).join("."),
            message: i.message,
          })),
          parsed.error
        )
      );
    }

    return ok(parsed.data);
  } catch (e) {
    if (e instanceof Error && e.name === "HTTPError") {
      const httpErr = e as unknown as { response: Response };
      const res = httpErr.response;
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        // ignore
      }
      const msg =
        typeof body === "object" && body && "message" in body
          ? String(body.message)
          : res.statusText;
      return err(new HttpError(res.status, msg, body, e));
    }

    if (e instanceof TypeError) {
      return err(new NetworkError(e));
    }

    return err(new UnknownError(e));
  }
}

export const api = {
  get: <T>(url: string, responseSchema: ZodType<T>, options?: Options) => {
    return ResultAsync.fromSafePromise(request("get", url, responseSchema, undefined, options));
  },

  post: <T>(url: string, payload: unknown, responseSchema: ZodType<T>, options?: Options) => {
    return ResultAsync.fromSafePromise(request("post", url, responseSchema, payload, options));
  },

  patch: <T>(url: string, payload: unknown, responseSchema: ZodType<T>, options?: Options) => {
    return ResultAsync.fromSafePromise(request("patch", url, responseSchema, payload, options));
  },

  delete: <T>(url: string, responseSchema: ZodType<T>, options?: Options) => {
    return ResultAsync.fromSafePromise(request("delete", url, responseSchema, undefined, options));
  },
};
