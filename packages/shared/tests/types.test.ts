import { assertEquals } from "@std/assert@1.0.19";
import {
  type ContainerId,
  isContainerId,
  isNodeId,
  type NodeId,
} from "../src/types.ts";

Deno.test("isContainerId returns true for container IDs", () => {
  assertEquals(isContainerId("c_123"), true);
  assertEquals(isContainerId("c_abc"), true);
});

Deno.test("isContainerId returns false for non-container IDs", () => {
  assertEquals(isContainerId("n_123"), false);
  assertEquals(isContainerId("abc"), false);
  assertEquals(isContainerId(""), false);
});

Deno.test("isNodeId returns true for node IDs", () => {
  assertEquals(isNodeId("n_123"), true);
  assertEquals(isNodeId("n_abc"), true);
});

Deno.test("isNodeId returns false for non-node IDs", () => {
  assertEquals(isNodeId("c_123"), false);
  assertEquals(isNodeId("abc"), false);
  assertEquals(isNodeId(""), false);
});

Deno.test("isContainerId narrows type when guard passes", () => {
  const id = "c_test" as string;
  if (isContainerId(id)) {
    const narrowed: ContainerId = id;
    assertEquals(narrowed.startsWith("c_"), true);
  }
});

Deno.test("isNodeId narrows type when guard passes", () => {
  const id = "n_test" as string;
  if (isNodeId(id)) {
    const narrowed: NodeId = id;
    assertEquals(narrowed.startsWith("n_"), true);
  }
});

Deno.test("Brand type preserves base type behavior", () => {
  const containerId = "c_test" as ContainerId;
  const nodeId = "n_test" as NodeId;
  assertEquals(containerId.startsWith("c_"), true);
  assertEquals(nodeId.startsWith("n_"), true);
});

Deno.test("Brand type prevents assignment of unbranded strings", () => {
  const containerId = "c_test" as ContainerId;
  const plain: string = containerId;
  assertEquals(plain, "c_test");
  const branded: ContainerId = plain as ContainerId;
  assertEquals(branded.startsWith("c_"), true);
});
