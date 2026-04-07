/**
 * DOM utility functions for attribute name normalization.
 * @module
 */

/**
 * Normalizes an ARIA attribute name from hyphenated form to camelCase.
 * Converts "aria-label" to "ariaLabel", "aria-labelledby" to "ariaLabelledby", etc.
 * @param name - The ARIA attribute name to normalize
 * @returns The normalized camelCase attribute name
 */
export function normalizeAriaName(name: string): string {
  return "aria" + name.slice(5, 6).toUpperCase() + name.slice(6);
}
