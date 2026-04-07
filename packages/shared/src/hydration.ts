/**
 * Hydration marker types and helpers for SSR hydration support.
 * @module
 */

import type { Brand } from "./types.ts";

/**
 * The HTML attribute name used for hydration markers on DOM elements.
 */
export const HYDRATION_ATTR = "data-hk";

/**
 * Branded string type for hydration paths (e.g., "0.1.3").
 * Paths are dot-separated indices representing the position in the tree.
 */
export type HydrationPath = Brand<string, "HydrationPath">;

/**
 * Type guard to check if a string is a valid HydrationPath.
 * Valid paths match the pattern: digits optionally separated by dots (e.g., "0.1.3").
 * @param value - The string to check
 * @returns True if the string is a valid HydrationPath
 */
export function isHydrationPath(value: string): value is HydrationPath {
  return /^\d+(\.\d+)*$/.test(value);
}

/**
 * Extracts the HydrationPath from a DOM element's data-hk attribute.
 * @param el - The DOM element to extract the path from
 * @returns The HydrationPath if found, otherwise null
 */
export function parseHydrationPath(el: Element): HydrationPath | null {
  const value = el.getAttribute(HYDRATION_ATTR);
  if (value === null || !isHydrationPath(value)) return null;
  return value as HydrationPath;
}

/**
 * Parses a HydrationPath from a string value.
 * @param value - The string to parse
 * @returns The HydrationPath if valid, otherwise null
 */
export function parseHydrationPathFromString(value: string): HydrationPath | null {
  if (!isHydrationPath(value)) return null;
  return value as HydrationPath;
}

/**
 * Builds a HydrationPath from a parent path and child index.
 * @param parentPath - The parent's HydrationPath, or null for root elements
 * @param childIndex - The child's index in the parent's children
 * @returns The constructed HydrationPath
 * @throws {Error} If the resulting path is invalid
 */
export function buildHydrationPath(
  parentPath: HydrationPath | null,
  childIndex: number,
): HydrationPath {
  const path = parentPath === null ? String(childIndex) : `${parentPath}.${childIndex}`;
  if (!isHydrationPath(path)) {
    throw new Error(`buildHydrationPath produced invalid path: ${path}`);
  }
  return path as HydrationPath;
}
