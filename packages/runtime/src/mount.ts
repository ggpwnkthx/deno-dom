/**
 * @ggpwnkthx/dom-runtime - Mount behavior.
 * @module
 */

import {
  type FragmentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  type VNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";
import { createDom, setProp } from "./dom/mod.ts";
import { isEventProp, setEventHandler } from "./events.ts";
import { isVNode, setDomRef } from "./types.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";

const MAX_MOUNT_DEPTH = 1000;

export function mount(vnode: VNode, container: ParentNode): void {
  if (!isVNode(vnode)) {
    throw new InvariantError(
      `mount expects a VNode but received ${
        typeof vnode === "object" && vnode !== null
          ? "an object with missing or invalid kind"
          : typeof vnode
      }`,
    );
  }
  const dom = createDomWithChildren(vnode, 0);
  container.appendChild(dom);
  setDomRef(vnode, dom);
}

function createDomWithChildren(vnode: VNode, depth: number): Node {
  if (depth > MAX_MOUNT_DEPTH) {
    throw new InvariantError(
      `Max mount depth exceeded (${MAX_MOUNT_DEPTH}). Possible circular vnode structure.`,
    );
  }
  if (isTextVNode(vnode)) {
    const dom = createDom(vnode);
    return dom;
  }
  if (isElementVNode(vnode)) {
    const dom = createDom(vnode);
    if (vnode.props) {
      for (const [key, value] of Object.entries(vnode.props)) {
        if (key === "children") continue;
        if (isEventProp(key)) {
          setEventHandler(dom as Element, key, value as (...args: unknown[]) => void);
        } else {
          setProp(dom as Element, key, value);
        }
      }
    }
    if (vnode.props?.children) {
      const children = vnode.props.children;
      const childArray = Array.isArray(children) ? children : [children];
      for (const child of childArray) {
        if (child === null || child === undefined) continue;
        const childDom = createDomWithChildren(child as VNode, depth + 1);
        dom.appendChild(childDom);
        setDomRef(child as VNode, childDom);
      }
    }
    return dom;
  }
  if (isFragmentVNode(vnode)) {
    const fragment = document.createDocumentFragment();
    const fragmentVNode = vnode as FragmentVNode;
    const children = fragmentVNode.children;
    if (children) {
      for (const child of children) {
        if (child === null || child === undefined) continue;
        const childDom = createDomWithChildren(child as VNode, depth + 1);
        fragment.appendChild(childDom);
        setDomRef(child as VNode, childDom);
      }
    }
    return fragment;
  }
  const dom = createDom(vnode);
  return dom;
}
