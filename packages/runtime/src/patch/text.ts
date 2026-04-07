/**
 * Text node patching for updating text content.
 * @module
 */

import type { TextVNode } from "@ggpwnkthx/jsx";
import { setText } from "../dom/mod.ts";

/**
 * Patches a text node with a new VNode.
 * Updates the text content if the text value has changed.
 * @param oldVNode - The previous text VNode
 * @param newVNode - The new text VNode
 * @param domNode - The actual DOM text node to update
 * @returns The same DOM text node
 */
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
