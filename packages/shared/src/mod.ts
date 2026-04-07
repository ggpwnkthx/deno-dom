/**
 * Shared types, errors, and validation helpers for the DOM package family.
 *
 * @module
 *
 * @example
 * ```typescript
 * import {
 *   assertString,
 *   DOMSharedError,
 *   err,
 *   HydrationPath,
 *   InvariantError,
 *   isHydrationPath,
 *   ok,
 *   type Result,
 *   ValidationError,
 * } from "@ggpwnkthx/dom-shared";
 *
 * // Result type for error-returning APIs
 * function divide(a: number, b: number): Result<string, number> {
 *   if (b === 0) return err("division by zero");
 *   return ok(a / b);
 * }
 *
 * // Typed errors
 * try {
 *   throw new ValidationError("field is required", { field: "email" });
 * } catch (e) {
 *   if (e instanceof DOMSharedError) {
 *     console.error(e.code);
 *   }
 * }
 *
 * // Hydration path utilities
 * const path = parseHydrationPath("0.1.2");
 * if (isHydrationPath(path)) {
 *   console.log(buildHydrationPath(path));
 * }
 * ```
 */

export {
  assertBoolean,
  assertExists,
  assertFunction,
  assertNever,
  assertNotImplemented,
  assertNumber,
  assertString,
} from "./assert.ts";

export {
  DOMSharedError,
  err,
  InvariantError,
  NotImplementedError,
  ok,
  ValidationError,
} from "./errors.ts";
export type { ErrorContext, Result } from "./errors.ts";

export {
  isBoolean,
  isFunction,
  isNonNull,
  isNumber,
  isPromiseLike,
  isString,
  requireFunction,
  requireNonNull,
  requireNumber,
  requireString,
} from "./validation.ts";

export type { Brand, ContainerId, NodeId } from "./types.ts";
export { isContainerId, isNodeId } from "./types.ts";

export {
  buildHydrationPath,
  HYDRATION_ATTR,
  isHydrationPath,
  parseHydrationPath,
  parseHydrationPathFromString,
} from "./hydration.ts";
export type { HydrationPath } from "./hydration.ts";

export { forEachChild } from "./vnode.ts";
export type { ChildCallback, VNodeChild } from "./vnode.ts";
