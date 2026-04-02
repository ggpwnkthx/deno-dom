/**
 * @ggpwnkthx/dom-runtime - Low-level DOM creation primitives.
 * @module
 */

import {
  type ElementVNode,
  isComponentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  type TextVNode,
  type VNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { setProp } from "./dom-set-prop.ts";

export function createDom(vnode: VNode): Node {
  if (isTextVNode(vnode)) {
    return createTextNode(vnode);
  }
  if (isElementVNode(vnode)) {
    return createElementNode(vnode);
  }
  if (isFragmentVNode(vnode)) {
    throw new InvariantError(
      "FragmentVNode should be handled inline by the caller using createDocumentFragment. Use mount() or patch() which handle fragments correctly.",
    );
  }
  if (isComponentVNode(vnode)) {
    throw new InvariantError(
      "ComponentVNode should not reach DOM creation - components must be evaluated before mounting",
    );
  }
  throw new InvariantError(`Unknown VNode kind: ${(vnode as VNode).kind}`);
}

function createTextNode(vnode: TextVNode): Text {
  return document.createTextNode(vnode.type);
}

function createElementNode(vnode: ElementVNode): HTMLElement {
  const el = document.createElement(vnode.type);
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key === "children") continue;
      setProp(el, key, value);
    }
  }
  return el;
}

export function replaceNode(oldDom: Node, newDom: Node): void {
  oldDom.parentNode?.replaceChild(newDom, oldDom);
}

export { setProp } from "./dom-set-prop.ts";
export { removeProp, setText } from "./dom-remove-prop.ts";
