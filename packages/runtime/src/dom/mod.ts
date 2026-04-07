/**
 * Low-level DOM creation primitives for converting VNodes to DOM nodes.
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

/**
 * Creates a DOM node from a VNode.
 * Handles TextVNode and ElementVNode types.
 * @param vnode - The VNode to convert to a DOM node
 * @returns A DOM Node (Text or Element)
 * @throws {InvariantError} If the VNode is a FragmentVNode or ComponentVNode
 * @example
 * ```ts
 * const textVNode = { kind: "text", type: "Hello" };
 * const textNode = createDom(textVNode); // Text node
 * ```
 */
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

/**
 * Replaces an old DOM node with a new DOM node in its parent.
 * @param oldDom - The DOM node to replace
 * @param newDom - The new DOM node to insert
 * @example
 * ```ts
 * const oldNode = document.getElementById("old")!;
 * const newNode = document.createElement("div");
 * replaceNode(oldNode, newNode);
 * ```
 */
export function replaceNode(oldDom: Node, newDom: Node): void {
  oldDom.parentNode?.replaceChild(newDom, oldDom);
}

export { removeProp, setProp, setText } from "./set-prop.ts";
