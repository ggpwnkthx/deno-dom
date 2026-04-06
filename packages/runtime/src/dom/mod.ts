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
} from "@ggpwnkthx/jsx";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { setProp } from "./set-prop.ts";
import { isEventProp, setEventHandler } from "../events.ts";

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

function createElementNode(vnode: ElementVNode): Element {
  const el = document.createElement(vnode.type);
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key === "children") continue;
      if (isEventProp(key)) {
        setEventHandler(el, key, value as (...args: unknown[]) => void);
      } else {
        setProp(el, key, value);
      }
    }
  }
  return el;
}

export function replaceNode(oldDom: Node, newDom: Node): void {
  oldDom.parentNode?.replaceChild(newDom, oldDom);
}

export { removeProp, setProp, setText } from "./set-prop.ts";
