/// <reference lib="dom" />

/**
 * @ggpwnkthx/dom-hydrate - Hydration type definitions.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";
import type { HydrationPath } from "@ggpwnkthx/dom-shared";

export type MismatchKind =
  | "tag-mismatch"
  | "marker-mismatch"
  | "type-mismatch"
  | "missing-child"
  | "extra-child"
  | "extra-text";

export interface MismatchInfo {
  kind: MismatchKind;
  vnode: VNode | null;
  domNode: Node | null;
  expectedPath: HydrationPath;
  actualPath?: HydrationPath;
}
