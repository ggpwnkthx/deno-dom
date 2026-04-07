/**
 * @ggpwnkthx/dom-hydrate - Hydration type definitions.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";
import { type HydrationPath, isHydrationPath } from "@ggpwnkthx/dom-shared";

export type MismatchKindWithVNode =
  | "tag-mismatch"
  | "marker-mismatch"
  | "type-mismatch"
  | "missing-child";

export type MismatchKindExtra = "extra-child" | "extra-text";

export type MismatchKind = MismatchKindWithVNode | MismatchKindExtra;

export interface MismatchWithVNode {
  kind: MismatchKindWithVNode;
  vnode: VNode;
  domNode: Node | null;
  expectedPath: HydrationPath;
  actualPath: HydrationPath | undefined;
}

export interface MismatchExtra {
  kind: MismatchKindExtra;
  vnode: null;
  domNode: Node;
  expectedPath: HydrationPath;
  actualPath: HydrationPath | undefined;
}

export type MismatchInfo = MismatchWithVNode | MismatchExtra;

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

export function isMismatchWithVNode(
  info: MismatchInfo,
): info is MismatchWithVNode {
  return info.vnode !== null;
}

export function isMismatchExtra(info: MismatchInfo): info is MismatchExtra {
  return info.vnode === null;
}
