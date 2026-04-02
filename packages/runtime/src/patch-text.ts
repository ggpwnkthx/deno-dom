/**
 * @ggpwnkthx/dom-runtime - Text node patching.
 * @module
 */

import type { TextVNode } from "jsr:@ggpwnkthx/jsx@0.1.8";
import { setText } from "./dom.ts";

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
