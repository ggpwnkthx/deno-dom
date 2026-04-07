/**
 * Error types and the Result type for explicit error handling.
 * @module
 */

/**
 * Contextual information attached to errors, including an optional name and value.
 */
export type ErrorContext = {
  readonly name?: string;
  readonly value?: unknown;
};

/**
 * Base error class for DOM shared errors, containing a code and optional context.
 */
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

/**
 * Error indicating a requested API or feature is not yet implemented.
 */
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

/**
 * Error thrown when validation fails (e.g., invalid input types or values).
 */
export class ValidationError extends DOMSharedError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "VALIDATION_FAILED", context);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when an internal invariant is violated — conditions that should never fail
 * in correct program flow. Use for internal assertions rather than external input validation.
 */
export class InvariantError extends DOMSharedError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "INVARIANT_VIOLATED", context);
    this.name = "InvariantError";
  }
}

/**
 * Result type representing either a success with a value or a failure with an error.
 * @typeParam T - The success value type
 * @typeParam E - The error type (defaults to DOMSharedError)
 * @example
 * ```ts
 * type OkResult = Result<string>;        // { ok: true; value: string }
 * type ErrResult = Result<never, Error>; // { ok: false; error: Error }
 * ```
 */
export type Result<T, E = DOMSharedError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Creates a successful Result with the given value.
 * @param value - The success value
 * @returns A Result with ok: true
 * @example
 * ```ts
 * const result = ok(42);
 * // result: { ok: true, value: 42 }
 * ```
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Creates a failed Result with the given error.
 * @param error - The error value
 * @returns A Result with ok: false
 * @example
 * ```ts
 * const result = err(new ValidationError("Invalid input"));
 * // result: { ok: false, error: ValidationError }
 * ```
 */
export function err<E extends DOMSharedError>(error: E): Result<never, E> {
  return { ok: false, error };
}
