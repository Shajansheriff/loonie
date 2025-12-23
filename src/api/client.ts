import ky, { type Options } from "ky";
import { type ZodType } from "zod/v4";

export class NetworkError extends Error {
  readonly _tag = "NetworkError" as const;

  constructor(cause: Error) {
    super(cause.message, { cause });
    this.name = "NetworkError";
  }
}

export class HttpError extends Error {
  readonly _tag = "HttpError" as const;
  readonly status: number;
  readonly body?: unknown;

  constructor(status: number, message: string, body?: unknown, cause?: Error) {
    super(message, { cause });
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export class ValidationError extends Error {
  readonly _tag = "ValidationError" as const;
  readonly issues: { path: string; message: string }[];

  constructor(issues: { path: string; message: string }[], cause?: unknown) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = issues;
    this.cause = cause;
  }
}

export class UnknownError extends Error {
  readonly _tag = "UnknownError" as const;

  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
    this.name = "UnknownError";
  }
}

export type ApiError = NetworkError | HttpError | ValidationError | UnknownError;

const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000";

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
): Promise<T> {
  try {
    const res = client[method](url, {
      ...options,
      ...(payload !== undefined && { json: payload }),
    });

    const response = await res.json();
    const parsed = schema.safeParse(response);

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((i) => ({
          path: i.path.map(String).join("."),
          message: i.message,
        })),
        parsed.error
      );
    }

    return parsed.data;
  } catch (e) {
    if (e instanceof ValidationError || e instanceof HttpError || e instanceof NetworkError) {
      throw e;
    }

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
      throw new HttpError(res.status, msg, body, e);
    }

    if (e instanceof TypeError) {
      throw new NetworkError(e);
    }

    throw new UnknownError(e);
  }
}

export const api = {
  get: <T>(url: string, responseSchema: ZodType<T>, options?: Options) => {
    return request<T>("get", url, responseSchema, undefined, options);
  },

  post: <T>(url: string, payload: unknown, responseSchema: ZodType<T>, options?: Options) => {
    return request<T>("post", url, responseSchema, payload, options);
  },

  patch: <T>(url: string, payload: unknown, responseSchema: ZodType<T>, options?: Options) => {
    return request<T>("patch", url, responseSchema, payload, options);
  },

  delete: <T>(url: string, responseSchema: ZodType<T>, options?: Options) => {
    return request<T>("delete", url, responseSchema, undefined, options);
  },
};
