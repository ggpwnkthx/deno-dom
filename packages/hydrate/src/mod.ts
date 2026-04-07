/**
 * @ggpwnkthx/dom-hydrate - SSR hydration behavior.
 * @module
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
