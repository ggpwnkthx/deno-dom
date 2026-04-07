/**
 * Hydration error types and factory functions for creating typed hydration errors.
 * @module
 */

import { DOMSharedError, type ErrorContext } from "@ggpwnkthx/dom-shared";

/**
 * Error codes for HydrationError to categorize failure modes.
 */
export type HydrationErrorCode =
  | "INVALID_VNODE"
  | "MAX_DEPTH_EXCEEDED"
  | "NON_VNODE_CHILD"
  | "DETACHED_NODE";

/**
 * Error thrown when hydration fails due to invalid VNodes, depth limits, or DOM state.
 */
export class HydrationError extends DOMSharedError {
  constructor(message: string, code: HydrationErrorCode, context?: ErrorContext) {
    super(message, code, context);
    this.name = "HydrationError";
  }
}

/**
 * Creates an INVALID_VNODE HydrationError.
 * @param value - The invalid value that was provided
 * @returns A HydrationError with INVALID_VNODE code
 */
export function invalidVNodeError(value: unknown): HydrationError {
  return new HydrationError(
    "hydrateResult expects a VNode",
    "INVALID_VNODE",
    { name: "vnode", value },
  );
}

/**
 * Creates a MAX_DEPTH_EXCEEDED HydrationError.
 * @param maxDepth - The maximum allowed hydration depth
 * @returns A HydrationError with MAX_DEPTH_EXCEEDED code
 */
export function maxDepthExceededError(maxDepth: number): HydrationError {
  return new HydrationError(
    `Max hydration depth exceeded (${maxDepth}). Possible circular vnode structure.`,
    "MAX_DEPTH_EXCEEDED",
    { name: "maxDepth", value: maxDepth },
  );
}

/**
 * Creates a NON_VNODE_CHILD HydrationError.
 * @param childType - The type of the invalid child
 * @param location - Where the non-VNode child was encountered
 * @returns A HydrationError with NON_VNODE_CHILD code
 */
export function nonVNodeChildError(
  childType: string,
  location: string,
): HydrationError {
  return new HydrationError(
    `Non-VNode child encountered (type: ${childType}) at ${location}`,
    "NON_VNODE_CHILD",
    { name: "childType", value: childType },
  );
}

/**
 * Creates a DETACHED_NODE HydrationError.
 * @returns A HydrationError with DETACHED_NODE code
 */
export function detachedNodeError(): HydrationError {
  return new HydrationError(
    "replaceWith called on detached node",
    "DETACHED_NODE",
  );
}
