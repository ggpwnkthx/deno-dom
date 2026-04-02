/**
 * @ggpwnkthx/dom-runtime - Patch behavior.
 * @module
 */

import {
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  type VNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";
import { createDom, removeProp, replaceNode, setProp, setText } from "./dom.ts";
import { isEventProp, setEventHandler } from "./events.ts";
import { isVNode, removeDomRef, setDomRef } from "./types.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";

const MAX_PATCH_DEPTH = 1000;

export function patch(
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
    return patchText(
      oldVNode as { type: string },
      newVNode as { type: string },
      domNode as Text,
    );
  }
  if (isElementVNode(newVNode)) {
    if (domNode.nodeType !== Node.ELEMENT_NODE) {
      throw new InvariantError(
        `Expected Element node but got ${domNode.nodeName}. VNode kind: element`,
      );
    }
    return patchElement(
      oldVNode as { type: string; props: Record<string, unknown> | null },
      newVNode as { type: string; props: Record<string, unknown> | null },
      domNode as Element,
      parentDom,
      depth + 1,
    );
  }
  if (isFragmentVNode(newVNode)) {
    return patchFragment(
      oldVNode as { children?: readonly unknown[] },
      newVNode as { children?: readonly unknown[] },
      domNode,
      parentDom,
      depth + 1,
    );
  }
  return domNode;
}

function patchText(
  oldVNode: { type: string },
  newVNode: { type: string },
  domNode: Text,
): Text {
  if (oldVNode.type !== newVNode.type) {
    setText(domNode, newVNode.type);
  }
  return domNode;
}

function patchElement(
  oldVNode: {
    type: string;
    props: Record<string, unknown> | null;
    children?: readonly unknown[];
  },
  newVNode: {
    type: string;
    props: Record<string, unknown> | null;
    children?: readonly unknown[];
  },
  domNode: Element,
  // Reserved for future use (e.g., keyed move optimization)
  _parentDom: ParentNode,
  depth: number,
): Element {
  if (oldVNode.type !== newVNode.type) {
    const newDom = createDom(newVNode as VNode);
    replaceNode(domNode, newDom);
    setDomRef(newVNode as VNode, newDom);
    removeDomRef(oldVNode as VNode);
    return newDom as Element;
  }
  patchProps(domNode, oldVNode.props ?? {}, newVNode.props ?? {});
  patchChildren(domNode, oldVNode.children ?? [], newVNode.children ?? [], depth);
  return domNode;
}

function patchChildren(
  domNode: Element,
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
        // Note: depth increments here (+1) and again at patch() entry, so each
        // child level counts as ~2 against MAX_PATCH_DEPTH. This is conservative.
        patch(
          oldChild as VNode,
          newChild as VNode,
          existingDom,
          domNode,
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

function patchProps(
  el: Element,
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>,
): void {
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
  for (const key of allKeys) {
    if (key === "children") continue;
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if (oldValue === newValue) continue;
    if (isEventProp(key)) {
      setEventHandler(
        el,
        key,
        newValue as (...args: unknown[]) => void,
        oldValue as (...args: unknown[]) => void,
      );
    } else if (newValue === null || newValue === undefined) {
      removeProp(el, key, oldValue);
    } else {
      setProp(el, key, newValue);
    }
  }
}

function patchFragment(
  oldVNode: { children?: readonly unknown[] },
  newVNode: { children?: readonly unknown[] },
  domNode: Node,
  // Reserved for future use (e.g., keyed move optimization)
  _parentDom: ParentNode,
  depth: number,
): Node {
  if (domNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    throw new InvariantError(
      `Expected DocumentFragment node but got ${domNode.nodeName}. VNode kind: fragment`,
    );
  }
  const oldChildren = oldVNode.children ?? [];
  const newChildren = newVNode.children ?? [];
  const domChildren = Array.from(domNode.childNodes);
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    if (i < domChildren.length) {
      const existingDom = domChildren[i];
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
  return domNode;
}
