/**
 * Runtime type definitions and DOM reference management for VNode-to-DOM mapping.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";

const domRefs = new WeakMap<VNode, Node | null>();

const fragmentRanges = new WeakMap<VNode, { parent: ParentNode; startIndex: number }>();

/**
 * Retrieves the DOM node associated with a VNode.
 * @param vnode - The VNode to look up
 * @returns The DOM node associated with the VNode, or null if not found
 */
export function getDomRef(vnode: VNode): Node | null {
  return domRefs.get(vnode) ?? null;
}

/**
 * Stores a DOM node reference for a VNode.
 * @param vnode - The VNode to associate
 * @param dom - The DOM node to associate with the VNode
 */
export function setDomRef(vnode: VNode, dom: Node): void {
  domRefs.set(vnode, dom);
}

/**
 * Stores a fragment range reference for a VNode.
 * Used for fragment VNodes to track their position in the DOM.
 * @param vnode - The fragment VNode to associate
 * @param parent - The parent DOM node containing the fragment
 * @param startIndex - The index of the first child node of the fragment in the parent
 */
export function setFragmentRef(
  vnode: VNode,
  parent: ParentNode,
  startIndex: number,
): void {
  domRefs.set(vnode, null);
  fragmentRanges.set(vnode, { parent, startIndex });
}

/**
 * Retrieves the fragment range associated with a VNode.
 * @param vnode - The VNode to look up
 * @returns The fragment range (parent node and start index), or undefined if not found
 */
export function getFragmentRange(
  vnode: VNode,
): { parent: ParentNode; startIndex: number } | undefined {
  return fragmentRanges.get(vnode);
}

/**
 * Removes all DOM references (both node and fragment range) for a VNode.
 * @param vnode - The VNode to remove references for
 */
export function removeDomRef(vnode: VNode): void {
  domRefs.delete(vnode);
  fragmentRanges.delete(vnode);
}
