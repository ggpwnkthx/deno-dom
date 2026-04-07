/**
 * @ggpwnkthx/dom - Umbrella package for the DOM package family.
 *
 * This facade provides a curated API for the most common use cases.
 * For lower-level or advanced APIs, import directly from the specific package:
 * - @ggpwnkthx/dom-runtime  - Client DOM mount and patch behavior
 * - @ggpwnkthx/dom-hydrate  - SSR hydration behavior
 * - @ggpwnkthx/dom-scheduler - Microtask batching and rerender scheduling
 * - @ggpwnkthx/dom-shared   - Shared types, errors, and validation helpers
 *
 * @module
 */

export { hydrate, hydrateResult } from "@ggpwnkthx/dom-hydrate";
export { HydrationError } from "@ggpwnkthx/dom-hydrate";
export type {
  HydrateOptions,
  MismatchInfo,
  MismatchKind,
} from "@ggpwnkthx/dom-hydrate";

export { mount, patch } from "@ggpwnkthx/dom-runtime";

export { schedule } from "@ggpwnkthx/dom-scheduler";
export type { Scheduler, SchedulerConfig } from "@ggpwnkthx/dom-scheduler";

export type { Result } from "@ggpwnkthx/dom-shared";
export {
  DOMSharedError,
  err,
  InvariantError,
  NotImplementedError,
  ok,
  ValidationError,
} from "@ggpwnkthx/dom-shared";
