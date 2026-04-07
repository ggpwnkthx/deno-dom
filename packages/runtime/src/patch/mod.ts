/**
 * Patch behavior for updating existing DOM nodes to match new VNodes.
 * @module
 */

import {
  type ElementVNode,
  type FragmentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  isVNode,
  type TextVNode,
  type VNode,
} from "@ggpwnkthx/jsx";
import { createDom, replaceNode } from "../dom/mod.ts";
import { getFragmentRange, removeDomRef, setDomRef } from "../types.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { patchText } from "./text.ts";
import { patchProps } from "./props.ts";
import { diffChildren, diffFragmentChildren, type PatchFn } from "./diff-children.ts";

const MAX_PATCH_DEPTH = 1000;

/**
 * Patches an existing DOM node to match a new VNode.
 * Updates the DOM in-place by comparing old and new VNodes.
 * Handles element, text, and fragment node types.
 * @param oldVNode - The previous VNode
 * @param newVNode - The new VNode to patch to
 * @param domNode - The current DOM node to update
 * @param parentDom - The parent DOM node (used for DOM reference management)
 * @param depth - Current recursion depth (prevents stack overflow)
 * @returns The updated DOM node (may be the same or a replacement)
 * @throws {InvariantError} If inputs are not valid VNodes or max depth is exceeded
 * @example
 * ```ts
 * const newDom = patch(oldVNode, newVNode, currentDom, parentDom);
 * ```
 */
function patch(
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
  parentDom: ParentNode,
  depth = 0,
): Node {
  if (!isVNode(oldVNode)) {
    throw new InvariantError(
      `patch expects oldVNode to be a VNode but received ${
        typeof oldVNode === "object" && oldVNode !== null
          ? "an object with missing or invalid kind"
          : typeof oldVNode
      }`,
    );
  }
  if (!isVNode(newVNode)) {
    throw new InvariantError(
      `patch expects newVNode to be a VNode but received ${
        typeof newVNode === "object" && newVNode !== null
          ? "an object with missing or invalid kind"
          : typeof newVNode
      }`,
    );
  }
  if (depth > MAX_PATCH_DEPTH) {
    throw new InvariantError(
      `Max patch depth exceeded (${MAX_PATCH_DEPTH}). Possible circular vnode structure.`,
    );
  }
  if (oldVNode.kind !== newVNode.kind) {
    const newDom = createDom(newVNode);
    replaceNode(domNode, newDom);
    setDomRef(newVNode, newDom);
    removeDomRef(oldVNode);
    return newDom;
  }
  if (isTextVNode(newVNode)) {
    if (domNode.nodeType !== Node.TEXT_NODE) {
      throw new InvariantError(
        `Expected Text node but got ${domNode.nodeName}. VNode kind: text`,
      );
    }
    return patchText(oldVNode as TextVNode, newVNode as TextVNode, domNode as Text);
  }
  if (isElementVNode(newVNode)) {
    if (domNode.nodeType !== Node.ELEMENT_NODE) {
      throw new InvariantError(
        `Expected Element node but got ${domNode.nodeName}. VNode kind: element`,
      );
    }
    return patchElement(
      patch,
      oldVNode as ElementVNode,
      newVNode as ElementVNode,
      domNode as Element,
      parentDom,
      depth + 1,
    );
  }
  if (isFragmentVNode(newVNode)) {
    return patchFragment(
      patch,
      oldVNode as FragmentVNode,
      newVNode as FragmentVNode,
      domNode,
      parentDom,
      depth + 1,
    );
  }
  return domNode;
}

function patchElement(
  patch: PatchFn,
  oldVNode: ElementVNode,
  newVNode: ElementVNode,
  domNode: Element,
  _parentDom: ParentNode,
  depth: number,
): Element {
  // Reserved for future use: keyed element reordering
  if (oldVNode.type !== newVNode.type) {
    const newDom = createDom(newVNode);
    replaceNode(domNode, newDom);
    setDomRef(newVNode, newDom);
    removeDomRef(oldVNode);
    return newDom as Element;
  }
  patchProps(domNode, oldVNode.props ?? {}, newVNode.props ?? {});
  diffChildren(patch, domNode, oldVNode.children ?? [], newVNode.children ?? [], depth);
  return domNode;
}

function patchFragment(
  patch: PatchFn,
  oldVNode: FragmentVNode,
  newVNode: FragmentVNode,
  domNode: Node,
  _parentDom: ParentNode,
  depth: number,
): Node {
  const range = getFragmentRange(oldVNode);
  if (range) {
    diffFragmentChildren(
      patch,
      range.parent,
      range.startIndex,
      oldVNode.children ?? [],
      newVNode.children ?? [],
      depth,
    );
    return domNode;
  }
  if (domNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    throw new InvariantError(
      `Expected DocumentFragment node but got ${domNode.nodeName}. VNode kind: fragment`,
    );
  }
  diffChildren(
    patch,
    domNode,
    oldVNode.children ?? [],
    newVNode.children ?? [],
    depth,
  );
  return domNode;
}

export { patch };
