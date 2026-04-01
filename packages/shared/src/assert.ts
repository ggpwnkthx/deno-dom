import { InvariantError, NotImplementedError, ValidationError } from "./errors.ts";
import { isBoolean, isFunction, isNonNull, isNumber, isString } from "./validation.ts";

/**
 * Asserts that value is not null or undefined.
 * Use for internal invariants — conditions that should never fail in correct program flow.
 * For external/untrusted input validation, use requireNonNull instead.
 * @throws {InvariantError}
 */
export function assertExists<T>(
  value: T,
  message = "value must not be null or undefined",
): asserts value is NonNullable<T> {
  if (!isNonNull(value)) {
    throw new InvariantError(message, { value });
  }
}

/**
 * Asserts that a value is never reached. Useful for exhaustive switch statements.
 * @throws {InvariantError}
 */
export function assertNever(
  _value: never,
  message = "unexpected value",
): never {
  throw new InvariantError(message);
}

/**
 * Throws NotImplementedError indicating the given API is not yet implemented.
 * @throws {NotImplementedError}
 */
export function assertNotImplemented(api: string): never {
  throw new NotImplementedError(api);
}

/**
 * Asserts that value is a string.
 * @throws {ValidationError}
 */
export function assertString(
  value: unknown,
  message = "value must be a string",
): asserts value is string {
  if (!isString(value)) {
    throw new ValidationError(message, { value });
  }
}

/**
 * Asserts that value is a number.
 * @throws {ValidationError}
 */
export function assertNumber(
  value: unknown,
  message = "value must be a number",
): asserts value is number {
  if (!isNumber(value)) {
    throw new ValidationError(message, { value });
  }
}

/**
 * Asserts that value is a function.
 * @throws {ValidationError}
 */
export function assertFunction(
  value: unknown,
  message = "value must be a function",
): asserts value is (...args: unknown[]) => unknown {
  if (!isFunction(value)) {
    throw new ValidationError(message, { value });
  }
}

/**
 * Asserts that value is a boolean.
 * @throws {ValidationError}
 */
export function assertBoolean(
  value: unknown,
  message = "value must be a boolean",
): asserts value is boolean {
  if (!isBoolean(value)) {
    throw new ValidationError(message, { value });
  }
}
