/**
 * @ggpwnkthx/dom-runtime - Runtime type definitions and DOM reference management.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";

const domRefs = new WeakMap<VNode, Node | null>();

export function getDomRef(vnode: VNode): Node | null {
  return domRefs.get(vnode) ?? null;
}

export function setDomRef(vnode: VNode, dom: Node): void {
  domRefs.set(vnode, dom);
}

export function removeDomRef(vnode: VNode): void {
  domRefs.delete(vnode);
}
