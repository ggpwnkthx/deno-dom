/// <reference lib="dom" />

/**
 * @ggpwnkthx/dom-hydrate - Hydration type definitions.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";
import type { HydrationPath } from "@ggpwnkthx/dom-shared";

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
