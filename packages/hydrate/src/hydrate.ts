/// <reference lib="dom" />

/**
 * @ggpwnkthx/dom-hydrate - SSR hydration implementation.
 * @module
 */

import {
  buildHydrationPath,
  forEachChild,
  type HydrationPath,
  InvariantError,
  parseHydrationPath,
} from "@ggpwnkthx/dom-shared";
import {
  createDom,
  removeProp,
  setDomRef,
  setEventHandler,
  setProp,
} from "@ggpwnkthx/dom-runtime";
import { warnMismatch } from "./diagnostics.ts";
import type { MismatchInfo } from "./types.ts";
import {
  type ElementVNode,
  type FragmentVNode,
  isComponentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  isVNode,
  type TextVNode,
  type VNode,
} from "@ggpwnkthx/jsx";

const MAX_HYDRATE_DEPTH = 1000;
const HYDRATION_MARKER = "data-hk";

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
    const dom = createDomDeep(vnode, 0);
    container.appendChild(dom);
    if (!isFragmentVNode(vnode)) {
      setDomRef(vnode, dom);
    }
    return vnode;
  }

  if (isFragmentVNode(vnode)) {
    hydrateFragmentRoot(vnode, container, options);
  } else {
    hydrateElement(vnode, rootDom as Element, rootPath, options, 0);
  }

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
  vnode: TextVNode,
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
      actualPath: undefined,
    };
    options?.onMismatch?.(mismatch);
    warnMismatch(mismatch);
    const newText = createDom(vnode);
    el.appendChild(newText);
    setDomRef(vnode, newText);
    return;
  }

  if (textNode.textContent !== vnode.type) {
    textNode.textContent = vnode.type;
  }

  setDomRef(vnode, textNode);
}

function hydrateElementNode(
  vnode: ElementVNode,
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
      actualPath: undefined,
    };
    options?.onMismatch?.(mismatch);
    warnMismatch(mismatch);
    replaceWith(vnode, el);
    return;
  }

  setDomRef(vnode, el);

  applyProps(el, vnode.props ?? {});

  hydrateChildren(vnode.children, el, path, options, depth + 1);
}

function hydrateFragmentNode(
  vnode: FragmentVNode,
  el: Element,
  path: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
): void {
  hydrateChildren(vnode.children, el, path, options, depth + 1);
}

function hydrateComponentNode(
  vnode: VNode,
  el: Element,
): void {
  setDomRef(vnode, el);
}

function hydrateFragmentRoot(
  vnode: FragmentVNode,
  container: ParentNode,
  options: HydrateOptions | undefined,
): void {
  const fragmentChildren = (vnode as VNode & { children?: unknown[] }).children;
  if (!fragmentChildren) return;

  const childArray = Array.isArray(fragmentChildren)
    ? fragmentChildren
    : [fragmentChildren];

  let elementIndex = 0;
  let domIndex = 0;

  for (const child of childArray) {
    if (child === null || child === undefined) continue;

    if (!isVNode(child)) {
      throw new InvariantError(
        `hydrateFragmentRoot encountered non-VNode child: ${typeof child}`,
      );
    }

    const childVNode = child as VNode;

    if (isTextVNode(childVNode)) {
      const domNode = container.childNodes[domIndex];
      if (domNode?.nodeType === Node.TEXT_NODE) {
        if (domNode.textContent !== childVNode.type) {
          domNode.textContent = childVNode.type;
        }
        setDomRef(childVNode, domNode);
        domIndex++;
      } else {
        const mismatch: MismatchInfo = {
          kind: "type-mismatch",
          vnode: childVNode,
          domNode: domNode ?? null,
          expectedPath: String(elementIndex) as HydrationPath,
          actualPath: undefined,
        };
        options?.onMismatch?.(mismatch);
        warnMismatch(mismatch);
        const textDom = createDom(childVNode);
        if (domNode && domNode.parentNode === container) {
          container.replaceChild(textDom, domNode);
        } else {
          container.appendChild(textDom);
        }
        setDomRef(childVNode, textDom);
        domIndex++;
      }
      continue;
    }

    if (isFragmentVNode(childVNode)) {
      const nestedChildren = (childVNode as VNode & { children?: unknown[] }).children;
      const nestedResult = hydrateNestedFragmentChildren(
        nestedChildren,
        container,
        elementIndex,
        domIndex,
        options,
      );
      elementIndex += nestedResult.elementCount;
      domIndex = nestedResult.domIndex;
      continue;
    }

    const expectedPath = String(elementIndex) as HydrationPath;

    let domNode = container.childNodes[domIndex];
    while (domNode && domNode.nodeType !== Node.ELEMENT_NODE) {
      domIndex++;
      domNode = container.childNodes[domIndex];
    }

    if (!domNode) {
      const mismatch: MismatchInfo = {
        kind: "missing-child",
        vnode: childVNode,
        domNode: null,
        expectedPath,
        actualPath: undefined,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      const newDom = createDomDeep(childVNode, 0);
      container.appendChild(newDom);
      setDomRef(childVNode, newDom);
      elementIndex++;
      domIndex++;
      continue;
    }

    hydrateElement(
      childVNode,
      domNode as Element,
      expectedPath,
      options,
      0,
    );

    elementIndex++;
    domIndex++;
  }

  detectExtraChildren(container as Element, domIndex, "" as HydrationPath, options);
}

function hydrateNestedFragmentChildren(
  children: unknown,
  container: ParentNode,
  startElementIndex: number,
  startDomIndex: number,
  options: HydrateOptions | undefined,
): { elementCount: number; domIndex: number } {
  if (!children) return { elementCount: 0, domIndex: startDomIndex };

  const childArray = Array.isArray(children) ? children : [children];

  let elementIndex = startElementIndex;
  let domIndex = startDomIndex;

  for (const child of childArray) {
    if (child === null || child === undefined) continue;

    if (!isVNode(child)) {
      throw new InvariantError(
        `hydrateNestedFragmentChildren encountered non-VNode child: ${typeof child}`,
      );
    }

    const childVNode = child as VNode;

    if (isTextVNode(childVNode)) {
      const domNode = container.childNodes[domIndex];
      if (domNode?.nodeType === Node.TEXT_NODE) {
        if (domNode.textContent !== childVNode.type) {
          domNode.textContent = childVNode.type;
        }
        setDomRef(childVNode, domNode);
        domIndex++;
      } else {
        const mismatch: MismatchInfo = {
          kind: "type-mismatch",
          vnode: childVNode,
          domNode: domNode ?? null,
          expectedPath: String(elementIndex) as HydrationPath,
          actualPath: undefined,
        };
        options?.onMismatch?.(mismatch);
        warnMismatch(mismatch);
        const textDom = createDom(childVNode);
        if (domNode && domNode.parentNode === container) {
          container.replaceChild(textDom, domNode);
        } else {
          container.appendChild(textDom);
        }
        setDomRef(childVNode, textDom);
        domIndex++;
      }
      continue;
    }

    if (isFragmentVNode(childVNode)) {
      const nestedChildren = (childVNode as VNode & { children?: unknown[] }).children;
      const nestedResult = hydrateNestedFragmentChildren(
        nestedChildren,
        container,
        elementIndex,
        domIndex,
        options,
      );
      elementIndex += nestedResult.elementCount;
      domIndex = nestedResult.domIndex;
      continue;
    }

    const expectedPath = String(elementIndex) as HydrationPath;

    let domNode = container.childNodes[domIndex];
    while (domNode && domNode.nodeType !== Node.ELEMENT_NODE) {
      domIndex++;
      domNode = container.childNodes[domIndex];
    }

    if (!domNode) {
      const mismatch: MismatchInfo = {
        kind: "missing-child",
        vnode: childVNode,
        domNode: null,
        expectedPath,
        actualPath: undefined,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      const newDom = createDomDeep(childVNode, 0);
      container.appendChild(newDom);
      setDomRef(childVNode, newDom);
      elementIndex++;
      domIndex++;
      continue;
    }

    hydrateElement(
      childVNode,
      domNode as Element,
      expectedPath,
      options,
      0,
    );

    elementIndex++;
    domIndex++;
  }

  return { elementCount: elementIndex - startElementIndex, domIndex };
}

function hydrateChildren(
  children: unknown,
  parentEl: Element,
  parentPath: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
): void {
  const result = hydrateChildrenInternal(
    children,
    parentEl,
    parentPath,
    options,
    depth,
    0,
    0,
  );
  detectExtraChildren(parentEl, result.domIndex, parentPath, options);
}

function hydrateChildrenInternal(
  children: unknown,
  parentEl: Element,
  parentPath: HydrationPath,
  options: HydrateOptions | undefined,
  depth: number,
  startElementIndex = 0,
  startDomIndex = 0,
): { elementCount: number; domIndex: number } {
  if (children === null || children === undefined) {
    return { elementCount: 0, domIndex: startDomIndex };
  }

  const childArray = Array.isArray(children) ? children : [children];

  let elementIndex = startElementIndex;
  let domIndex = startDomIndex;

  for (const child of childArray) {
    if (child === null || child === undefined) continue;

    if (!isVNode(child)) {
      throw new InvariantError(
        `hydrateChildrenInternal encountered non-VNode child at path ${parentPath}: ${typeof child}`,
      );
    }

    const childVNode = child as VNode;

    if (isTextVNode(childVNode)) {
      const domNode = parentEl.childNodes[domIndex];
      if (domNode?.nodeType === Node.TEXT_NODE) {
        if (domNode.textContent !== childVNode.type) {
          domNode.textContent = childVNode.type;
        }
        setDomRef(childVNode, domNode);
        domIndex++;
      } else {
        const mismatch: MismatchInfo = {
          kind: "type-mismatch",
          vnode: childVNode,
          domNode: domNode ?? null,
          expectedPath: parentPath,
          actualPath: undefined,
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
        domIndex++;
      }
      continue;
    }

    if (isFragmentVNode(childVNode)) {
      const fragmentChildren =
        (childVNode as VNode & { children?: unknown[] }).children;
      const fragmentResult = hydrateChildrenInternal(
        fragmentChildren,
        parentEl,
        parentPath,
        options,
        depth,
        elementIndex,
        domIndex,
      );
      elementIndex += fragmentResult.elementCount;
      domIndex = fragmentResult.domIndex;
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
        actualPath: undefined,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      const newDom = createDomDeep(childVNode, depth);
      parentEl.appendChild(newDom);
      setDomRef(childVNode, newDom);
      elementIndex++;
      domIndex++;
      continue;
    }

    if (isElementVNode(childVNode)) {
      hydrateElementNode(
        childVNode as ElementVNode,
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

  return { elementCount: elementIndex - startElementIndex, domIndex };
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
      // Decrement i to re-examine this index after node removal,
      // since childNodes is a live collection and subsequent nodes shift left.
      i--;
    } else if (domNode.nodeType === Node.TEXT_NODE) {
      const mismatch: MismatchInfo = {
        kind: "extra-text",
        vnode: null,
        domNode,
        expectedPath: parentPath,
        actualPath: undefined,
      };
      options?.onMismatch?.(mismatch);
      warnMismatch(mismatch);
      domNode.remove();
      // Decrement i to re-examine this index after node removal,
      // since childNodes is a live collection and subsequent nodes shift left.
      i--;
    }
  }
}

function applyProps(el: Element, props: Record<string, unknown>): void {
  if (!props) return;

  const propKeys = new Set(Object.keys(props));
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (!propKeys.has(attr.name) && attr.name !== HYDRATION_MARKER) {
      removeProp(el, attr.name);
      i--;
    }
  }

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
  const newDom = createDomDeep(vnode, 0);
  if (!oldDom.parentNode) {
    throw new InvariantError("replaceWith called on detached node");
  }
  oldDom.parentNode.replaceChild(newDom, oldDom);
  if (!isFragmentVNode(vnode)) {
    setDomRef(vnode, newDom);
  }
}

function createDomDeep(vnode: VNode, depth: number): Node {
  if (depth > MAX_HYDRATE_DEPTH) {
    throw new InvariantError(
      `Max hydration depth exceeded (${MAX_HYDRATE_DEPTH}). Possible circular vnode structure.`,
    );
  }

  if (isTextVNode(vnode)) {
    return createDom(vnode);
  }

  if (isElementVNode(vnode)) {
    const el = createDom(vnode) as Element;
    applyProps(el, vnode.props ?? {});
    appendChildren(el, vnode.children, depth);
    return el;
  }

  if (isFragmentVNode(vnode)) {
    const fragment = document.createDocumentFragment();
    appendChildren(
      fragment,
      (vnode as VNode & { children?: unknown[] }).children,
      depth,
    );
    return fragment;
  }

  if (isComponentVNode(vnode)) {
    throw new InvariantError(
      "ComponentVNode should not reach createDom - components must be evaluated before hydration",
    );
  }

  return vnode as never; // exhaustive: all VNode kinds handled above
}

function appendChildren(
  parent: Element | DocumentFragment,
  children: unknown,
  depth: number,
): void {
  forEachChild(children, depth, (child: unknown) => {
    if (!isVNode(child)) {
      throw new InvariantError(
        `appendChildren encountered non-VNode child at depth ${depth}: ${typeof child}`,
      );
    }
    const childDom = createDomDeep(child, depth + 1);
    parent.appendChild(childDom);
    if (!isFragmentVNode(child)) {
      setDomRef(child, childDom);
    }
  });
}
