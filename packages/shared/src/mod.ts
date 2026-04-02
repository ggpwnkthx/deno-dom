/**
 * @ggpwnkthx/dom-shared - Shared types, errors, and validation helpers.
 * @module
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
} from "./hydration.ts";
export type { HydrationPath } from "./hydration.ts";
