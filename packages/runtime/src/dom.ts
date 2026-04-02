/**
 * @ggpwnkthx/dom-runtime - Low-level DOM creation primitives.
 * @module
 */

import {
  isComponentVNode,
  isElementVNode,
  isFragmentVNode,
  isTextVNode,
  type VNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { isEventProp } from "./events.ts";

export function createDom(vnode: VNode): Node {
  if (isTextVNode(vnode)) {
    return createTextNode(vnode);
  }
  if (isElementVNode(vnode)) {
    return createElementNode(vnode);
  }
  if (isFragmentVNode(vnode)) {
    throw new InvariantError(
      "FragmentVNode should be handled inline by the caller using createDocumentFragment. Use mount() or patch() which handle fragments correctly.",
    );
  }
  if (isComponentVNode(vnode)) {
    throw new InvariantError(
      "ComponentVNode should not reach DOM creation - components must be evaluated before mounting",
    );
  }
  throw new InvariantError(`Unknown VNode kind: ${(vnode as VNode).kind}`);
}

function createTextNode(vnode: { type: string; props: null }): Text {
  return document.createTextNode(vnode.type);
}

function createElementNode(vnode: {
  type: string;
  props: Record<string, unknown> | null;
}): HTMLElement {
  const el = document.createElement(vnode.type);
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key === "children") continue;
      setProp(el, key, value);
    }
  }
  return el;
}

export function setProp(el: Element, name: string, value: unknown): void {
  if (isEventProp(name)) {
    return;
  }
  if (value === null || value === undefined) {
    return;
  }
  if (name === "class") {
    el.className = String(value);
    return;
  }
  if (name === "id") {
    el.id = String(value);
    return;
  }
  if (name === "value") {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    if ("value" in input) {
      input.value = String(value);
    }
    return;
  }
  if (name === "checked") {
    const input = el as HTMLInputElement;
    if ("checked" in input) {
      input.checked = Boolean(value);
    }
    return;
  }
  if (name === "selected") {
    const option = el as HTMLOptionElement;
    if ("selected" in option) {
      option.selected = Boolean(value);
    }
    return;
  }
  if (name.startsWith("data-")) {
    const dataKey = name.slice(5);
    (el as HTMLElement).dataset[dataKey] = String(value);
    return;
  }
  if (name === "style" && typeof value === "object") {
    Object.assign((el as HTMLElement).style, value);
    return;
  }
  if (typeof value === "boolean") {
    if (value) {
      el.setAttribute(name, "");
    } else {
      el.removeAttribute(name);
    }
    return;
  }
  if (name.startsWith("aria-")) {
    const ariaKey = "aria" + name.slice(5, 6).toUpperCase() + name.slice(6);
    (el as unknown as Record<string, string>)[ariaKey] = String(value);
    return;
  }
  el.setAttribute(name, String(value));
}

export function removeProp(el: Element, name: string, _oldValue: unknown): void {
  if (isEventProp(name)) {
    return;
  }
  if (name === "class") {
    el.className = "";
    return;
  }
  if (name === "id") {
    el.id = "";
    return;
  }
  if (name === "value") {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    if ("value" in input) {
      input.value = "";
    }
    return;
  }
  if (name === "checked") {
    const input = el as HTMLInputElement;
    if ("checked" in input) {
      input.checked = false;
    }
    return;
  }
  if (name === "selected") {
    const option = el as HTMLOptionElement;
    if ("selected" in option) {
      option.selected = false;
    }
    return;
  }
  if (name.startsWith("data-")) {
    const dataKey = name.slice(5);
    delete (el as HTMLElement).dataset[dataKey];
    return;
  }
  if (name.startsWith("aria-")) {
    const ariaKey = "aria" + name.slice(5, 6).toUpperCase() + name.slice(6);
    (el as unknown as Record<string, string>)[ariaKey] = "";
    return;
  }
  if (name === "style") {
    (el as HTMLElement).style.cssText = "";
    return;
  }
  el.removeAttribute(name);
}

export function setText(node: Text, text: string | number): void {
  node.textContent = String(text);
}

export function replaceNode(oldDom: Node, newDom: Node): void {
  oldDom.parentNode?.replaceChild(newDom, oldDom);
}
