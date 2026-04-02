/**
 * @ggpwnkthx/dom-runtime - Property patching.
 * @module
 */

import { InvariantError } from "@ggpwnkthx/dom-shared";
import { removeProp, setProp } from "../dom/mod.ts";
import { isEventProp, setEventHandler } from "../events.ts";

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
