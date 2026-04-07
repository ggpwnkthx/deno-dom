/**
 * Hydration type definitions for mismatch detection and reporting.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";
import { type HydrationPath, isHydrationPath } from "@ggpwnkthx/dom-shared";

/**
 * Kinds of mismatches that include an associated VNode.
 * These indicate the server-rendered DOM differs from what the VNode expects.
 */
export type MismatchKindWithVNode =
  | "tag-mismatch"
  | "marker-mismatch"
  | "type-mismatch"
  | "missing-child";

/**
 * Kinds of mismatches where the DOM has extra nodes not present in the VNode tree.
 * These indicate nodes in the DOM that have no corresponding VNode.
 */
export type MismatchKindExtra = "extra-child" | "extra-text";

/**
 * All possible kinds of hydration mismatches.
 */
export type MismatchKind = MismatchKindWithVNode | MismatchKindExtra;

/**
 * Information about a hydration mismatch where a VNode is present.
 * The DOM node exists but doesn't match what the VNode expects.
 */
export interface MismatchWithVNode {
  kind: MismatchKindWithVNode;
  vnode: VNode;
  domNode: Node | null;
  expectedPath: HydrationPath;
  actualPath: HydrationPath | undefined;
}

/**
 * Information about a hydration mismatch where no VNode is present.
 * The DOM contains extra nodes that have no corresponding VNode.
 */
export interface MismatchExtra {
  kind: MismatchKindExtra;
  vnode: null;
  domNode: Node;
  expectedPath: HydrationPath;
  actualPath: HydrationPath | undefined;
}

/**
 * Complete information about a hydration mismatch.
 * Either a mismatch with an associated VNode, or an extra DOM node.
 */
export type MismatchInfo = MismatchWithVNode | MismatchExtra;

/**
 * Type guard to check if a value is a valid MismatchInfo object.
 * @param value - The value to check
 * @returns True if the value is a MismatchInfo
 * @example
 * ```ts
 * if (isMismatchInfo(something)) {
 *   console.log("Mismatch at path:", something.expectedPath);
 * }
 * ```
 */
export function isMismatchInfo(value: unknown): value is MismatchInfo {
  if (value === null || typeof value !== "object") return false;
  const info = value as MismatchInfo;
  return (
    typeof info.kind === "string"
    && (info.kind === "tag-mismatch"
      || info.kind === "marker-mismatch"
      || info.kind === "type-mismatch"
      || info.kind === "missing-child"
      || info.kind === "extra-child"
      || info.kind === "extra-text")
    && info.expectedPath !== undefined
    && isHydrationPath(info.expectedPath)
  );
}

/**
 * Type guard to check if a MismatchInfo has an associated VNode.
 * @param info - The MismatchInfo to check
 * @returns True if the mismatch has an associated VNode
 * @example
 * ```ts
 * if (isMismatchWithVNode(info)) {
 *   // info has vnode property
 *   console.log("VNode type:", info.vnode.type);
 * }
 * ```
 */
export function isMismatchWithVNode(
  info: MismatchInfo,
): info is MismatchWithVNode {
  return info.vnode !== null;
}

/**
 * Type guard to check if a MismatchInfo represents an extra DOM node.
 * @param info - The MismatchInfo to check
 * @returns True if the mismatch represents an extra node
 * @example
 * ```ts
 * if (isMismatchExtra(info)) {
 *   // info has null vnode and extra DOM node
 *   info.domNode.remove();
 * }
 * ```
 */
export function isMismatchExtra(info: MismatchInfo): info is MismatchExtra {
  return info.vnode === null;
}
