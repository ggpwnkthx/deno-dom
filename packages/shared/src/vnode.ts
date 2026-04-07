/**
 * Shared VNode utilities for traversing and manipulating VNode trees.
 * @module
 */

/**
 * Represents a child node within a VNode tree. May be a primitive value, VNode, or array of VNodes.
 */
export type VNodeChild = unknown;

/**
 * Callback function for iterating over VNode children.
 * @param child - The current child element
 * @param depth - The current depth in the tree
 * @param index - The index of the current child among its siblings
 */
export type ChildCallback = (
  child: VNodeChild,
  depth: number,
  index: number,
) => void;

/**
 * Iterates over children of a VNode, calling the callback for each non-null child.
 * @param children - The children to iterate over (may be a single child or array)
 * @param depth - The initial depth for all children
 * @param callback - The function to call for each non-null child
 */
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
