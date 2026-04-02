/**
 * @ggpwnkthx/dom-runtime - Runtime type definitions and DOM reference management.
 * @module
 */

import type {
  ComponentVNode,
  ElementVNode,
  FragmentVNode,
  Key,
  TextVNode,
  VNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";

export type { ComponentVNode, ElementVNode, FragmentVNode, Key, TextVNode, VNode };

export type { VNodeKind } from "jsr:@ggpwnkthx/jsx@0.1.8";

export {
  isComponentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  isVNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";

const domRefs = new WeakMap<VNode, Node>();

export function getDomRef(vnode: VNode): Node | null {
  return domRefs.get(vnode) ?? null;
}

export function setDomRef(vnode: VNode, dom: Node): void {
  domRefs.set(vnode, dom);
}

export function removeDomRef(vnode: VNode): void {
  domRefs.delete(vnode);
}
