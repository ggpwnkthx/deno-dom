import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: two consecutive extra nodes both get removed", () => {
  const ssrHTML =
    '<div data-hk="0"><span data-hk="0.0">Keep</span><p data-hk="0.1">Extra1</p><p data-hk="0.2">Extra2</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingSpan = existingRoot.firstElementChild as HTMLSpanElement;

  const keepText = createTextVNode("Keep");
  const keep = createElementVNode("span", null, null, [keepText]);
  const vnode = createElementVNode("div", null, null, [keep]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  assertEquals(currentRoot === existingRoot, true);
  assertEquals(currentRoot.childNodes.length, 1);
  assertEquals(currentRoot.firstElementChild === existingSpan, true);
  assertEquals(getDomRef(keep) === existingSpan, true);

  assertEquals(mismatches.length, 2);
  assertEquals(mismatches[0]?.kind, "extra-child");
  assertEquals(mismatches[1]?.kind, "extra-child");
});
