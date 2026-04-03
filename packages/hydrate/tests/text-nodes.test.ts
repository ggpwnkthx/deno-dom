import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: leading text nodes do not affect element hydration paths", () => {
  const ssrHTML =
    '<div data-hk="0">lead<p data-hk="0.0">First</p><p data-hk="0.1">Second</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingLeadText = existingRoot.firstChild as Text;
  const existingFirstParagraph = existingRoot.childNodes[1] as HTMLParagraphElement;
  const existingSecondParagraph = existingRoot.childNodes[2] as HTMLParagraphElement;

  const leadText = createTextVNode("lead");
  const firstText = createTextVNode("First");
  const secondText = createTextVNode("Second");
  const firstParagraph = createElementVNode("p", null, null, [firstText]);
  const secondParagraph = createElementVNode("p", null, null, [secondText]);
  const vnode = createElementVNode("div", null, null, [
    leadText,
    firstParagraph,
    secondParagraph,
  ]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(getDomRef(leadText) === existingLeadText, true);
  assertEquals(getDomRef(firstParagraph) === existingFirstParagraph, true);
  assertEquals(getDomRef(secondParagraph) === existingSecondParagraph, true);

  assertEquals(existingFirstParagraph.getAttribute("data-hk"), "0.0");
  assertEquals(existingSecondParagraph.getAttribute("data-hk"), "0.1");
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: existing text node with different content is patched in place", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.0">Old text</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingParagraph = existingRoot.firstElementChild as HTMLParagraphElement;
  const existingTextNode = existingParagraph.firstChild as Text;

  const newText = createTextVNode("New text");
  const paragraph = createElementVNode("p", null, null, [newText]);
  const vnode = createElementVNode("div", null, null, [paragraph]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(existingParagraph.firstChild === existingTextNode, true);
  assertEquals(existingTextNode.textContent, "New text");
  assertEquals(getDomRef(newText) === existingTextNode, true);
  assertEquals(mismatches.length, 0);
});
