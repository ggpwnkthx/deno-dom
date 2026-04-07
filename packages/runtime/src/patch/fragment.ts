/**
 * Fragment patching for updating DocumentFragment nodes.
 * @module
 */

import type { FragmentVNode } from "@ggpwnkthx/jsx";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { diffChildren, type PatchFn } from "./diff-children.ts";

/**
 * Patches a DocumentFragment node with new fragment children.
 * Diffes the old and new children and updates the DOM accordingly.
 * @param patch - The patch function to apply recursively
 * @param oldVNode - The previous fragment VNode
 * @param newVNode - The new fragment VNode
 * @param domNode - The DOM node (should be a DocumentFragment)
 * @param _parentDom - The parent DOM node (unused, reserved for future keyed reordering)
 * @param depth - The current recursion depth for preventing stack overflow
 * @returns The same DOM node
 * @throws {InvariantError} If domNode is not a DocumentFragment
 */
export function patchFragment(
  patch: PatchFn,
  oldVNode: FragmentVNode,
  newVNode: FragmentVNode,
  domNode: Node,
  _parentDom: ParentNode,
  depth: number,
): Node {
  if (domNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    throw new InvariantError(
      `Expected DocumentFragment node but got ${domNode.nodeName}. VNode kind: fragment`,
    );
  }
  diffChildren(patch, domNode, oldVNode.children ?? [], newVNode.children ?? [], depth);
  return domNode;
}
