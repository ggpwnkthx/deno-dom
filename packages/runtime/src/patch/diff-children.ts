/**
 * @ggpwnkthx/dom-runtime - Children diffing utility.
 * @module
 */

import type { VNode } from "@ggpwnkthx/jsx";
import { createDom } from "../dom/mod.ts";
import { removeDomRef, setDomRef } from "../types.ts";

export type PatchFn = (
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
  parentDom: ParentNode,
  depth?: number,
) => Node;

function diffArrayChildren(
  patch: PatchFn,
  existingDomChildren: Node[],
  oldChildren: readonly unknown[],
  newChildren: readonly unknown[],
  depth: number,
  parentDom: ParentNode,
): void {
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
        parentDom.removeChild(existingDom);
      } else if (oldChild === null || oldChild === undefined) {
        const newDom = createDom(newChild as VNode);
        parentDom.insertBefore(newDom, existingDom);
        setDomRef(newChild as VNode, newDom);
      } else {
        patch(
          oldChild as VNode,
          newChild as VNode,
          existingDom,
          parentDom,
          depth + 1,
        );
      }
    } else if (newChild !== null && newChild !== undefined) {
      const newDom = createDom(newChild as VNode);
      parentDom.appendChild(newDom);
      setDomRef(newChild as VNode, newDom);
    }
  }
}

export function diffChildren(
  patch: PatchFn,
  domNode: Node,
  oldChildren: readonly unknown[],
  newChildren: readonly unknown[],
  depth: number,
): void {
  const existingDomChildren = Array.from(domNode.childNodes);
  diffArrayChildren(
    patch,
    existingDomChildren,
    oldChildren,
    newChildren,
    depth,
    domNode as ParentNode,
  );
}

export function diffFragmentChildren(
  patch: PatchFn,
  parentDom: ParentNode,
  startIndex: number,
  oldChildren: readonly unknown[],
  newChildren: readonly unknown[],
  depth: number,
): void {
  const existingDomChildren = Array.from(parentDom.childNodes);
  const slicedChildren = existingDomChildren.slice(startIndex);
  diffArrayChildren(patch, slicedChildren, oldChildren, newChildren, depth, parentDom);
}
