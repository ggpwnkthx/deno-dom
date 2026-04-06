/**
 * @ggpwnkthx/dom-hydrate - Hydration error types.
 * @module
 */

import { DOMSharedError, type ErrorContext } from "@ggpwnkthx/dom-shared";

export type HydrationErrorCode =
  | "INVALID_VNODE"
  | "MAX_DEPTH_EXCEEDED"
  | "NON_VNODE_CHILD"
  | "DETACHED_NODE";

export class HydrationError extends DOMSharedError {
  constructor(message: string, code: HydrationErrorCode, context?: ErrorContext) {
    super(message, code, context);
    this.name = "HydrationError";
  }
}

export function invalidVNodeError(value: unknown): HydrationError {
  return new HydrationError(
    "hydrateResult expects a VNode",
    "INVALID_VNODE",
    { name: "vnode", value },
  );
}

export function maxDepthExceededError(maxDepth: number): HydrationError {
  return new HydrationError(
    `Max hydration depth exceeded (${maxDepth}). Possible circular vnode structure.`,
    "MAX_DEPTH_EXCEEDED",
    { name: "maxDepth", value: maxDepth },
  );
}

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

export function detachedNodeError(): HydrationError {
  return new HydrationError(
    "replaceWith called on detached node",
    "DETACHED_NODE",
  );
}
