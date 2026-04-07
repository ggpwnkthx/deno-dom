/// <reference lib="dom" />

/**
 * @ggpwnkthx/dom-shared - Hydration marker types and helpers.
 * @module
 */

import type { Brand } from "./types.ts";

export const HYDRATION_ATTR = "data-hk";

export type HydrationPath = Brand<string, "HydrationPath">;

export function isHydrationPath(value: string): value is HydrationPath {
  return /^\d+(\.\d+)*$/.test(value);
}

export function parseHydrationPath(el: Element): HydrationPath | null {
  const value = el.getAttribute(HYDRATION_ATTR);
  if (value === null || !isHydrationPath(value)) return null;
  return value as HydrationPath;
}

export function parseHydrationPathFromString(value: string): HydrationPath | null {
  if (!isHydrationPath(value)) return null;
  return value as HydrationPath;
}

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
