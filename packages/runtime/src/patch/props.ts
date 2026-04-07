/**
 * Property patching for comparing and updating element props and attributes.
 * @module
 */

import { InvariantError } from "@ggpwnkthx/dom-shared";
import { removeProp, setProp } from "../dom/mod.ts";
import { isEventProp, setEventHandler } from "../events.ts";

/**
 * Patches the properties and attributes of an element by comparing old and new props.
 * Adds, updates, or removes attributes as needed.
 * Handles event handlers specially by using setEventHandler with the old handler.
 * @param el - The element to patch
 * @param oldProps - The previous props object
 * @param newProps - The new props object
 * @throws {InvariantError} If an event prop does not have a function value
 */
export function patchProps(
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
      if (typeof newValue !== "function") {
        throw new InvariantError(
          `Expected event handler for "${key}" but received ${typeof newValue}`,
        );
      }
      setEventHandler(
        el,
        key,
        newValue as (...args: unknown[]) => void,
        oldValue as (...args: unknown[]) => void,
      );
    } else if (newValue === null || newValue === undefined) {
      removeProp(el, key);
    } else {
      setProp(el, key, newValue);
    }
  }
}
