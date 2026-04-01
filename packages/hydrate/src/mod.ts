/**
 * @ggpwnkthx/dom-hydrate - SSR hydration behavior.
 * @module
 */

import { NotImplementedError } from "@ggpwnkthx/dom-shared";

export function hydrate(): never {
  throw new NotImplementedError("hydrate");
}

export function walk(): never {
  throw new NotImplementedError("walk");
}
