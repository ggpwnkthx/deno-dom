/**
 * @ggpwnkthx/dom-shared - Shared VNode utilities.
 * @module
 */

export type VNodeChild = unknown;

export type ChildCallback = (
  child: VNodeChild,
  depth: number,
  index: number,
) => void;

export function forEachChild(
  children: unknown,
  depth: number,
  callback: ChildCallback,
): void {
  if (!children) return;
  const childArray = Array.isArray(children) ? children : [children];
  let index = 0;
  for (const child of childArray) {
    if (child === null || child === undefined) continue;
    callback(child, depth, index);
    index++;
  }
}
