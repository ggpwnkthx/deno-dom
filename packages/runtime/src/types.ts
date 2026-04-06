/**
 * @ggpwnkthx/dom-runtime - Runtime type definitions and DOM reference management.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";

const domRefs = new WeakMap<VNode, Node | null>();

const fragmentRanges = new WeakMap<VNode, { parent: ParentNode; startIndex: number }>();

export function getDomRef(vnode: VNode): Node | null {
  return domRefs.get(vnode) ?? null;
}

export function setDomRef(vnode: VNode, dom: Node): void {
  domRefs.set(vnode, dom);
}

export function setFragmentRef(
  vnode: VNode,
  parent: ParentNode,
  startIndex: number,
): void {
  domRefs.set(vnode, null);
  fragmentRanges.set(vnode, { parent, startIndex });
}

export function getFragmentRange(
  vnode: VNode,
): { parent: ParentNode; startIndex: number } | undefined {
  return fragmentRanges.get(vnode);
}

export function removeDomRef(vnode: VNode): void {
  domRefs.delete(vnode);
  fragmentRanges.delete(vnode);
}
