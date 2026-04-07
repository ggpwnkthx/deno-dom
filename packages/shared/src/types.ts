/**
 * Utility types for the DOM package family, including branded types for IDs.
 * @module
 */

/**
 * Utility type for branding base types with a unique tag.
 * Used to create nominal types from structural types (e.g., ContainerId, NodeId).
 * @typeParam Base - The base type to brand
 * @typeParam Tag - A unique string tag identifying this brand
 */
export type Brand<Base, Tag extends string> = Base & { readonly _brand: Tag };

/**
 * Branded string type for container identifiers. Valid containers start with "c_".
 */
export type ContainerId = Brand<string, "ContainerId">;

/**
 * Branded string type for node identifiers. Valid nodes start with "n_".
 */
export type NodeId = Brand<string, "NodeId">;

/**
 * Type guard to check if a string is a valid ContainerId.
 * @param id - The string to check
 * @returns True if the string starts with "c_"
 */
export function isContainerId(id: string): id is ContainerId {
  return id.startsWith("c_");
}

/**
 * Type guard to check if a string is a valid NodeId.
 * @param id - The string to check
 * @returns True if the string starts with "n_"
 */
export function isNodeId(id: string): id is NodeId {
  return id.startsWith("n_");
}
