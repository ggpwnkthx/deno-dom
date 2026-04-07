/**
 * Type guards and validation functions for runtime type checking.
 * @module
 */

import { ValidationError } from "./errors.ts";

/**
 * Type guard to check if a value is a string.
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if a value is a number.
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

/**
 * Type guard to check if a value is a function.
 * @param value - The value to check
 * @returns True if the value is a function
 */
export function isFunction(
  value: unknown,
): value is (...args: unknown[]) => unknown {
  return typeof value === "function";
}

/**
 * Type guard to check if a value is a boolean.
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Type guard to check if a value is not null or undefined.
 * @param value - The value to check
 * @returns True if the value is not null or undefined
 */
export function isNonNull<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is promise-like (has a `.then` method).
 * @param value - The value to check
 * @returns True if the value has a then method
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return isObject(value) && isFunction((value as Record<string, unknown>)["then"]);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Asserts that value is a string, throwing with the parameter name on failure.
 * Use for validating external/untrusted string input.
 * @throws {ValidationError}
 */
export function requireString(value: unknown, name: string): string {
  if (!isString(value)) {
    throw new ValidationError(`${name} must be a string`, { name, value });
  }
  return value;
}

/**
 * Asserts that value is a number, throwing with the parameter name on failure.
 * Use for validating external/untrusted numeric input.
 * @throws {ValidationError}
 */
export function requireNumber(value: unknown, name: string): number {
  if (!isNumber(value)) {
    throw new ValidationError(`${name} must be a number`, { name, value });
  }
  return value;
}

/**
 * Asserts that value is a function, throwing with the parameter name on failure.
 * Use for validating external/untrusted function input.
 * @throws {ValidationError}
 */
export function requireFunction(
  value: unknown,
  name: string,
): (...args: unknown[]) => unknown {
  if (!isFunction(value)) {
    throw new ValidationError(`${name} must be a function`, { name, value });
  }
  return value;
}

/**
 * Asserts that value is not null or undefined, throwing with the parameter name on failure.
 * Use for validating external/untrusted input — conditions that may reasonably fail.
 * For internal invariants that should never fail, use assertExists instead.
 * @throws {ValidationError}
 */
export function requireNonNull<T>(value: T, name: string): NonNullable<T> {
  if (!isNonNull(value)) {
    throw new ValidationError(`${name} must not be null or undefined`, {
      name,
      value,
    });
  }
  return value;
}
