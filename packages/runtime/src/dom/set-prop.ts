/**
 * @ggpwnkthx/dom-runtime - DOM property setter utilities.
 * @module
 */

import { assertIsNotEventProp, normalizeAriaName } from "../events.ts";

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
    const ariaKey = normalizeAriaName(name);
    (el as unknown as Record<string, string>)[ariaKey] = String(value);
    return;
  }
  el.setAttribute(name, String(value));
}
