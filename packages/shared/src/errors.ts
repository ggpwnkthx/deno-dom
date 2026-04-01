export type ErrorContext = {
  readonly name?: string;
  readonly value?: unknown;
};

export class DOMSharedError extends Error {
  readonly code: string;
  readonly context?: ErrorContext;

  constructor(message: string, code = "DOM_SHARED_ERROR", context?: ErrorContext) {
    super(message);
    this.name = "DOMSharedError";
    this.code = code;
    this.context = context;
  }
}

export class NotImplementedError extends DOMSharedError {
  constructor(api: string) {
    super(
      `${api} is not implemented yet`,
      "NOT_IMPLEMENTED",
      { name: "api", value: api },
    );
    this.name = "NotImplementedError";
  }
}

export class ValidationError extends DOMSharedError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "VALIDATION_FAILED", context);
    this.name = "ValidationError";
  }
}

export class InvariantError extends DOMSharedError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "INVARIANT_VIOLATED", context);
    this.name = "InvariantError";
  }
}

export type Result<T, E = DOMSharedError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends DOMSharedError>(error: E): Result<never, E> {
  return { ok: false, error };
}
