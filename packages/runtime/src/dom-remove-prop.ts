/**
 * @ggpwnkthx/dom-runtime - DOM property remover utilities.
 * @module
 */

import { isEventProp } from "./events.ts";

export function removeProp(el: Element, name: string): void {
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
