/**
 * @ggpwnkthx/dom-runtime - Fragment patching.
 * @module
 */

import type { FragmentVNode } from "@ggpwnkthx/jsx";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { diffChildren, type PatchFn } from "./diff-children.ts";

export function patchFragment(
  patch: PatchFn,
  oldVNode: FragmentVNode,
  newVNode: FragmentVNode,
  domNode: Node,
  _parentDom: ParentNode,
  depth: number,
): Node {
  // Reserved for future use: keyed fragment reordering
  if (domNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    throw new InvariantError(
      `Expected DocumentFragment node but got ${domNode.nodeName}. VNode kind: fragment`,
    );
  }
  diffChildren(patch, domNode, oldVNode.children ?? [], newVNode.children ?? [], depth);
  return domNode;
}
