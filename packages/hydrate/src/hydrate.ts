/// <reference lib="dom" />

/**
 * @ggpwnkthx/dom-hydrate - SSR hydration implementation.
 * @module
 */

import {
  buildHydrationPath,
  type HydrationPath,
  parseHydrationPath,
} from "@ggpwnkthx/dom-shared";
import {
  createDom,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  isVNode,
  setDomRef,
  setEventHandler,
  setProp,
} from "@ggpwnkthx/dom-runtime";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { warnMismatch } from "./diagnostics.ts";
import type { MismatchInfo } from "./types.ts";
import type { VNode } from "jsr:@ggpwnkthx/jsx@0.1.8";

const MAX_HYDRATE_DEPTH = 1000;

export interface HydrateOptions {
  onMismatch?: (info: MismatchInfo) => void;
}

export function hydrate(
  vnode: VNode,
  container: ParentNode,
  options?: HydrateOptions,
): VNode {
  if (!isVNode(vnode)) {
    throw new InvariantError("hydrate expects a VNode");
  }

  const rootPath = "0" as HydrationPath;
  const rootDom = container.firstElementChild;

  if (!rootDom) {
    const dom = createDom(vnode);
    container.appendChild(dom);
    setDomRef(vnode, dom);
    return vnode;
  }

  hydrateElement(vnode, rootDom as Element, rootPath, options, 0);

  return vnode;
}

function hydrateElement(
  vnode: VNode,
  el: Element,
  path: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
): void {
  if (depth > MAX_HYDRATE_DEPTH) {
    throw new InvariantError(
      `Max hydration depth exceeded (${MAX_HYDRATE_DEPTH}). Possible circular vnode structure.`,
    );
  }

  if (isTextVNode(vnode)) {
    hydrateTextNode(vnode, el, path, options);
    return;
  }

  if (isElementVNode(vnode)) {
    hydrateElementNode(vnode, el, path, options, depth);
    return;
  }

  if (isFragmentVNode(vnode)) {
    hydrateFragmentNode(vnode, el, path, options, depth);
    return;
  }

  hydrateComponentNode(vnode, el);
}

function hydrateTextNode(
  vnode: VNode & { type: string },
  el: Element,
  path: HydrationPath,
  options: HydrateOptions | undefined,
): void {
  const textNode = el.childNodes[0];
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    const mismatch: MismatchInfo = {
      kind: "type-mismatch",
      vnode,
      domNode: textNode ?? null,
      expectedPath: path,
    };
    options?.onMismatch?.(mismatch);
    warnMismatch(mismatch);
    const newText = createDom(vnode);
    el.appendChild(newText);
    setDomRef(vnode, newText);
    return;
  }

  setDomRef(vnode, textNode);
}

function hydrateElementNode(
  vnode: VNode & { type: string; props: Record<string, unknown> | null },
  el: Element,
  path: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
): void {
  const markerPath = parseHydrationPath(el);

  if (markerPath !== path) {
    const mismatch: MismatchInfo = {
      kind: "marker-mismatch",
      vnode,
      domNode: el,
      expectedPath: path,
      actualPath: markerPath ?? undefined,
    };
    options?.onMismatch?.(mismatch);
    warnMismatch(mismatch);
    replaceWith(vnode, el);
    return;
  }

  if (el.tagName.toLowerCase() !== vnode.type) {
    const mismatch: MismatchInfo = {
      kind: "tag-mismatch",
      vnode,
      domNode: el,
      expectedPath: path,
    };
    options?.onMismatch?.(mismatch);
    warnMismatch(mismatch);
    replaceWith(vnode, el);
    return;
  }

  setDomRef(vnode, el);

  applyProps(el, vnode.props ?? {});

  hydrateChildren(vnode.props?.children, el, path, options, depth + 1);
}

function hydrateFragmentNode(
  vnode: VNode & { children?: unknown[] },
  el: Element,
  path: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
): void {
  setDomRef(vnode, el);
  hydrateChildren(vnode.children, el, path, options, depth + 1);
}

function hydrateComponentNode(
  vnode: VNode,
  el: Element,
): void {
  setDomRef(vnode, el);
}

function hydrateChildren(
  children: unknown,
  parentEl: Element,
  parentPath: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
): void {
  // Invariant: elementIndex counts only element/component children (for path
  // construction). domIndex counts all child nodes (elements + text nodes).
  // elementIndex only advances when a non-text child is processed.
  if (children === null || children === undefined) {
    detectExtraChildren(parentEl, 0, parentPath, options);
    return;
  }

  const childArray = Array.isArray(children) ? children : [children];

  let elementIndex = 0;
  let domIndex = 0;

  for (const child of childArray) {
    if (child === null || child === undefined) continue;

    const childVNode = child as VNode;

    if (isTextVNode(childVNode)) {
      const domNode = parentEl.childNodes[domIndex];
      if (domNode?.nodeType === Node.TEXT_NODE) {
        setDomRef(childVNode, domNode);
        domIndex++;
      } else {
        const mismatch: MismatchInfo = {
          kind: "type-mismatch",
          vnode: childVNode,
          domNode: domNode ?? null,
          expectedPath: parentPath,
        };
        options?.onMismatch?.(mismatch);
        warnMismatch(mismatch);
        const textDom = createDom(childVNode);
        if (domNode && domNode.parentNode === parentEl) {
          parentEl.replaceChild(textDom, domNode);
        } else {
          parentEl.appendChild(textDom);
        }
        setDomRef(childVNode, textDom);
      }
      continue;
    }

    if (isFragmentVNode(childVNode)) {
      hydrateChildren(
        (childVNode as VNode & { children?: unknown[] }).children,
        parentEl,
        parentPath,
        options,
        depth,
      );
      continue;
    }

    const expectedPath = buildHydrationPath(parentPath, elementIndex);

    let domNode = parentEl.childNodes[domIndex];
    while (domNode && domNode.nodeType !== Node.ELEMENT_NODE) {
      domIndex++;
      domNode = parentEl.childNodes[domIndex];
    }

    if (!domNode) {
      const mismatch: MismatchInfo = {
        kind: "missing-child",
        vnode: childVNode,
        domNode: null,
        expectedPath: expectedPath,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      const newDom = createDom(childVNode);
      parentEl.appendChild(newDom);
      setDomRef(childVNode, newDom);
      elementIndex++;
      domIndex++;
      continue;
    }

    if (isElementVNode(childVNode)) {
      hydrateElementNode(
        childVNode as VNode & { type: string; props: Record<string, unknown> | null },
        domNode as Element,
        expectedPath,
        options,
        depth,
      );
    } else {
      hydrateElement(
        childVNode,
        domNode as Element,
        expectedPath,
        options,
        depth,
      );
    }

    elementIndex++;
    domIndex++;
  }

  detectExtraChildren(parentEl, domIndex, parentPath, options);
}

function detectExtraChildren(
  parentEl: Element,
  startDomIndex: number,
  parentPath: HydrationPath,
  options: HydrateOptions | undefined,
): void {
  for (let i = startDomIndex; i < parentEl.childNodes.length; i++) {
    const domNode = parentEl.childNodes[i];
    // Only ELEMENT_NODE and TEXT_NODE are reported; comment nodes, CDATA,
    // and other node types are ignored since SSR does not emit them.
    if (domNode.nodeType === Node.ELEMENT_NODE) {
      const markerPath = parseHydrationPath(domNode as Element);
      const mismatch: MismatchInfo = {
        kind: "extra-child",
        vnode: null,
        domNode,
        expectedPath: parentPath,
        actualPath: markerPath ?? undefined,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      domNode.remove();
    } else if (domNode.nodeType === Node.TEXT_NODE) {
      const mismatch: MismatchInfo = {
        kind: "extra-text",
        vnode: null,
        domNode,
        expectedPath: parentPath,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      domNode.remove();
    }
  }
}

function applyProps(el: Element, props: Record<string, unknown>): void {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (key.startsWith("on") && typeof value === "function") {
      setEventHandler(el, key, value as (...args: unknown[]) => void);
    } else {
      setProp(el, key, value);
    }
  }
}

function replaceWith(vnode: VNode, oldDom: Node): void {
  const newDom = createDom(vnode);
  if (!oldDom.parentNode) {
    throw new InvariantError("replaceWith called on detached node");
  }
  oldDom.parentNode.replaceChild(newDom, oldDom);
  setDomRef(vnode, newDom);
}
