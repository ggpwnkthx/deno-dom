import { assertThrows } from "@std/assert";
import { createElementVNode, type VNode } from "@ggpwnkthx/jsx";
import { hydrate } from "../src/hydrate.ts";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: throws descriptive error for non-VNode children", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.0">Text</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const vnode = createElementVNode("div", null, null, [
    "not a vnode",
  ] as unknown as VNode[]);

  assertThrows(
    () => hydrate(vnode, container),
    Error,
    "non-VNode child",
  );
});
