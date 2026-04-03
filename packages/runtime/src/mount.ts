/**
 * @ggpwnkthx/dom-runtime - Mount behavior.
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
import { setDomRef } from "./types.ts";
import { forEachChild, InvariantError } from "@ggpwnkthx/dom-shared";

const MAX_MOUNT_DEPTH = 1000;

function appendChild(
  parent: Element | DocumentFragment,
  child: unknown,
  depth: number,
): void {
  const childDom = createDomWithChildren(child as VNode, depth + 1);
  parent.appendChild(childDom);
  setDomRef(child as VNode, childDom);
}

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
    if (vnode.props?.children) {
      forEachChild(vnode.props.children, depth, (child: unknown) => {
        appendChild(el, child, depth);
      });
    } else if (vnode.children) {
      forEachChild(vnode.children, depth, (child: unknown) => {
        appendChild(el, child, depth);
      });
    }
    return el;
  }
  if (isFragmentVNode(vnode)) {
    const fragment = document.createDocumentFragment();
    const fragmentVNode = vnode as FragmentVNode;
    forEachChild(fragmentVNode.children, depth, (child: unknown) => {
      appendChild(fragment, child, depth);
    });
    return fragment;
  }
  const dom = createDom(vnode);
  return dom;
}
