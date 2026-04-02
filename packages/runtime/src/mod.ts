/**
 * @ggpwnkthx/dom-runtime - Client DOM mount and patch behavior.
 * @module
 */

import { mount } from "./mount.ts";
import { patch } from "./patch/mod.ts";

export { mount, patch };

export type { VNode } from "jsr:@ggpwnkthx/jsx@0.1.8";

export {
  isComponentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  isVNode,
} from "./types.ts";

export { createDom, replaceNode, setProp, setText } from "./dom/mod.ts";
export { getDomRef, removeDomRef, setDomRef } from "./types.ts";
export { isEventProp, setEventHandler } from "./events.ts";
