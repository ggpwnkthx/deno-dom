/**
 * @ggpwnkthx/dom-runtime - Client DOM mount and patch behavior.
 * @module
 */

import { NotImplementedError } from "@ggpwnkthx/dom-shared";

export function mount(): never {
  throw new NotImplementedError("mount");
}

export function patch(): never {
  throw new NotImplementedError("patch");
}
