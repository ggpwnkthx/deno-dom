export type Brand<Base, Tag extends string> = Base & { readonly _brand: Tag };

export type ContainerId = Brand<string, "ContainerId">;
export type NodeId = Brand<string, "NodeId">;

export function isContainerId(id: string): id is ContainerId {
  return id.startsWith("c_");
}

export function isNodeId(id: string): id is NodeId {
  return id.startsWith("n_");
}
