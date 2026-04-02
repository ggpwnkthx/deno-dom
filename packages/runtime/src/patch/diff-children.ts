/**
 * @ggpwnkthx/dom-runtime - Children diffing utility.
 * @module
 */

import type { VNode } from "jsr:@ggpwnkthx/jsx@0.1.8";
import { createDom } from "../dom/mod.ts";
import { removeDomRef, setDomRef } from "../types.ts";

export type PatchFn = (
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
  parentDom: ParentNode,
  depth?: number,
) => Node;

export function diffChildren(
  patch: PatchFn,
  domNode: Node,
  oldChildren: readonly unknown[],
  newChildren: readonly unknown[],
  depth: number,
): void {
  const existingDomChildren = Array.from(domNode.childNodes);
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    if (i < existingDomChildren.length) {
      const existingDom = existingDomChildren[i];
      if (newChild === null || newChild === undefined) {
        if (oldChild !== null && oldChild !== undefined) {
          removeDomRef(oldChild as VNode);
        }
        domNode.removeChild(existingDom);
      } else if (oldChild === null || oldChild === undefined) {
        const newDom = createDom(newChild as VNode);
        domNode.insertBefore(newDom, existingDom);
        setDomRef(newChild as VNode, newDom);
      } else {
        patch(
          oldChild as VNode,
          newChild as VNode,
          existingDom,
          domNode as ParentNode,
          depth + 1,
        );
      }
    } else if (newChild !== null && newChild !== undefined) {
      const newDom = createDom(newChild as VNode);
      domNode.appendChild(newDom);
      setDomRef(newChild as VNode, newDom);
    }
  }
}
