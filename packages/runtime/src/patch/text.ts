/**
 * @ggpwnkthx/dom-runtime - Text node patching.
 * @module
 */

import type { TextVNode } from "@ggpwnkthx/jsx";
import { setText } from "../dom/mod.ts";

export function patchText(
  oldVNode: TextVNode,
  newVNode: TextVNode,
  domNode: Text,
): Text {
  if (oldVNode.type !== newVNode.type) {
    setText(domNode, newVNode.type);
  }
  return domNode;
}
