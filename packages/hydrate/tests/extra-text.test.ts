import { assertEquals } from "@std/assert";
import { Node } from "@b-fuze/deno-dom";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import type { MismatchExtra } from "../src/types.ts";
import { env } from "./test-environment.ts";
import { makePath } from "./_shared-test-helpers.ts";

Deno.test("hydrate decision: extra text node after element is removed and reported as extra-text", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.0">Kept</p>Extra text node</div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingParagraph = existingRoot.firstElementChild as HTMLParagraphElement;

  const keptText = createTextVNode("Kept");
  const keptParagraph = createElementVNode("p", null, null, [keptText]);
  const vnode = createElementVNode("div", null, null, [keptParagraph]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  assertEquals(currentRoot === existingRoot, true);
  assertEquals(currentRoot.childNodes.length, 1);
  assertEquals(currentRoot.firstElementChild === existingParagraph, true);

  const domRef = getDomRef(keptParagraph);
  assertEquals(domRef != null, true);
  const refNode = domRef as unknown as Node;
  assertEquals(refNode === (existingParagraph as unknown as Node), true);

  const extraTextMismatch = mismatches.find((m) => m.kind === "extra-text");
  assertEquals(extraTextMismatch != null, true);
  if (extraTextMismatch) {
    const extra = extraTextMismatch as MismatchExtra;
    assertEquals(extra.vnode, null);
    assertEquals(extra.domNode.nodeType, Node.TEXT_NODE);
    assertEquals(extra.expectedPath, makePath("0"));
  }
});
