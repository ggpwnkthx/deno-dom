/**
 * SSR hydration behavior for hydrating server-rendered VNodes into existing DOM trees.
 *
 * @module
 *
 * @example
 * ```typescript
 * import { hydrate, hydrateResult } from "@ggpwnkthx/dom-hydrate";
 * import type { VNode } from "@ggpwnkthx/jsx";
 *
 * // Server-rendered HTML container with hydration markers
 * const container = document.querySelector('[data-hk="0"]')!;
 * const vnode: VNode = { type: "div", props: {}, children: [] };
 *
 * // Throw-based API
 * hydrate(vnode, container, {
 *   onMismatch: (mismatch) => console.warn("Hydration mismatch:", mismatch),
 * });
 *
 * // Result-based API for error-safe callers
 * const result = hydrateResult(vnode, container);
 * if (!result.ok) {
 *   console.error("Hydration failed:", result.error.code);
 * }
 * ```
 */

export { hydrate, hydrateResult } from "./hydrate.ts";
export {
  isMismatchExtra,
  isMismatchInfo,
  isMismatchWithVNode,
  type MismatchInfo,
  type MismatchKind,
} from "./types.ts";
export type { HydrateOptions } from "./hydrate.ts";
export { HydrationError } from "./errors.ts";
export type { Result } from "@ggpwnkthx/dom-shared";
