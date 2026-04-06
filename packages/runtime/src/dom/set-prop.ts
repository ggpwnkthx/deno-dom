/**
 * @ggpwnkthx/dom-runtime - DOM property setter utilities.
 * @module
 */

import { assertIsNotEventProp } from "../events.ts";
import { normalizeAriaName } from "./utils.ts";

function setProperty(
  el: Element,
  name: string,
  value: unknown,
  defaultValue: unknown,
): void {
  if (name in el) {
    (el as unknown as Record<string, unknown>)[name] = value === undefined
      ? defaultValue
      : value;
  }
}

function setDataProp(el: Element, name: string, value: unknown): void {
  const dataKey = name.slice(5);
  const htmlEl = el as HTMLElement;
  if (htmlEl.dataset) {
    htmlEl.dataset[dataKey] = String(value);
  }
}

function removeDataProp(el: Element, name: string): void {
  const dataKey = name.slice(5);
  const htmlEl = el as HTMLElement;
  if (htmlEl.dataset) {
    delete htmlEl.dataset[dataKey];
  }
}

function setAriaProp(el: Element, name: string, value: unknown): void {
  const ariaKey = normalizeAriaName(name);
  const htmlEl = el as unknown as Record<string, string>;
  if (htmlEl) {
    htmlEl[ariaKey] = String(value);
  }
}

function removeAriaProp(el: Element, name: string): void {
  const ariaKey = normalizeAriaName(name);
  const htmlEl = el as unknown as Record<string, string>;
  if (htmlEl) {
    htmlEl[ariaKey] = "";
  }
}

function setStyleProp(el: Element, value: unknown): void {
  const htmlEl = el as HTMLElement;
  if (htmlEl.style && typeof value === "object") {
    Object.assign(htmlEl.style, value);
  }
}

function removeStyleProp(el: Element): void {
  const htmlEl = el as HTMLElement;
  if (htmlEl.style) {
    htmlEl.style.cssText = "";
  }
}

export function setProp(el: Element, name: string, value: unknown): void {
  assertIsNotEventProp(name);
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
    setProperty(el, name, String(value), "");
    return;
  }
  if (name === "checked") {
    setProperty(el, name, Boolean(value), false);
    return;
  }
  if (name === "selected") {
    setProperty(el, name, Boolean(value), false);
    return;
  }
  if (name.startsWith("data-")) {
    setDataProp(el, name, value);
    return;
  }
  if (name === "style") {
    setStyleProp(el, value);
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
    setAriaProp(el, name, value);
    return;
  }
  el.setAttribute(name, String(value));
}

export function removeProp(el: Element, name: string): void {
  assertIsNotEventProp(name);
  if (name === "class") {
    el.className = "";
    return;
  }
  if (name === "id") {
    el.id = "";
    return;
  }
  if (name === "value") {
    setProperty(el, name, "", "");
    return;
  }
  if (name === "checked") {
    setProperty(el, name, false, false);
    return;
  }
  if (name === "selected") {
    setProperty(el, name, false, false);
    return;
  }
  if (name.startsWith("data-")) {
    removeDataProp(el, name);
    return;
  }
  if (name.startsWith("aria-")) {
    removeAriaProp(el, name);
    return;
  }
  if (name === "style") {
    removeStyleProp(el);
    return;
  }
  el.removeAttribute(name);
}

export function setText(node: Text, text: string | number): void {
  node.textContent = String(text);
}
