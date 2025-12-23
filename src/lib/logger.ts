

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: unknown, context?: LogContext) => void;
}

const isDev = import.meta.env.DEV;

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}


export const logger: Logger = {
  debug: (message, context) => {
    if (isDev) {
      console.debug(formatMessage("debug", message, context));
    }
  },

  info: (message, context) => {
    console.info(formatMessage("info", message, context));
  },

  warn: (message, context) => {
    console.warn(formatMessage("warn", message, context));
  },

  error: (message, error, context) => {
    console.error(formatMessage("error", message, context));
    if (error) {
      console.error(error);
    }
  },
};


export function captureException(error: unknown, context?: LogContext): void {
  logger.error("Captured exception", error, context);

}

