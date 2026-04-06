/**
 * @ggpwnkthx/dom-runtime - DOM utility functions.
 * @module
 */

export function normalizeAriaName(name: string): string {
  return "aria" + name.slice(5, 6).toUpperCase() + name.slice(6);
}
