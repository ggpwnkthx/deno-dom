/**
 * Mount behavior for converting VNode trees into DOM nodes.
 * @module
 */

import {
  type FragmentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  isVNode,
  type VNode,
} from "@ggpwnkthx/jsx";
import { createDom, setProp } from "./dom/mod.ts";
import { isEventProp, setEventHandler } from "./events.ts";
import { setDomRef, setFragmentRef } from "./types.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";

const MAX_MOUNT_DEPTH = 1000;

/**
 * Mounts a VNode tree to a DOM container.
 * Converts the VNode and all its children into real DOM nodes and appends them to the container.
 * @param vnode - The VNode to mount
 * @param container - The parent DOM node to append the mounted nodes to
 * @throws {InvariantError} If vnode is not a valid VNode or max depth is exceeded
 * @example
 * ```ts
 * const vnode = { kind: "element", type: "div", props: { class: "container" } };
 * mount(vnode, document.getElementById("app")!);
 * ```
 */
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
  if (isFragmentVNode(vnode)) {
    const startIndex = container.childNodes.length;
    const dom = createDomWithChildren(vnode, 0);
    container.appendChild(dom);
    setDomRef(vnode, dom);
    setFragmentRef(vnode, container, startIndex);
  } else {
    const dom = createDomWithChildren(vnode, 0);
    container.appendChild(dom);
    setDomRef(vnode, dom);
  }
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
    const el = createDom(vnode) as Element;
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
    if (vnode.props?.children && Array.isArray(vnode.props.children)) {
      for (const child of vnode.props.children) {
        const childDom = createDomWithChildren(child as VNode, depth + 1);
        el.appendChild(childDom);
        setDomRef(child as VNode, childDom);
      }
    } else if (vnode.children && Array.isArray(vnode.children)) {
      for (const child of vnode.children) {
        const childDom = createDomWithChildren(child as VNode, depth + 1);
        el.appendChild(childDom);
        setDomRef(child as VNode, childDom);
      }
    }
    return el;
  }
  if (isFragmentVNode(vnode)) {
    const fragment = document.createDocumentFragment();
    const fragmentVNode = vnode as FragmentVNode;
    if (fragmentVNode.children && Array.isArray(fragmentVNode.children)) {
      for (const child of fragmentVNode.children) {
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
