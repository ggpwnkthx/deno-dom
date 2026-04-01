/**
 * @ggpwnkthx/dom-scheduler - Microtask batching and rerender scheduling.
 * @module
 */

import { NotImplementedError } from "@ggpwnkthx/dom-shared";

export function queueUpdate(): never {
  throw new NotImplementedError("queueUpdate");
}

export function schedule(): never {
  throw new NotImplementedError("schedule");
}
