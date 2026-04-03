import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: exact match preserves existing nodes and attaches DOM refs", () => {
  const ssrHTML =
    '<div data-hk="0"><h1 data-hk="0.0">Hello</h1><p data-hk="0.1">World</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingTitle = existingRoot.firstElementChild as HTMLHeadingElement;
  const existingTitleText = existingTitle.firstChild as Text;
  const existingBody = existingRoot.lastElementChild as HTMLParagraphElement;
  const existingBodyText = existingBody.firstChild as Text;

  const titleText = createTextVNode("Hello");
  const bodyText = createTextVNode("World");
  const title = createElementVNode("h1", null, null, [titleText]);
  const body = createElementVNode("p", null, null, [bodyText]);
  const vnode = createElementVNode("div", null, null, [title, body]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(container.firstElementChild === existingRoot, true);
  assertEquals(existingRoot.firstElementChild === existingTitle, true);
  assertEquals(existingRoot.lastElementChild === existingBody, true);

  assertEquals(getDomRef(vnode) === existingRoot, true);
  assertEquals(getDomRef(title) === existingTitle, true);
  assertEquals(getDomRef(titleText) === existingTitleText, true);
  assertEquals(getDomRef(body) === existingBody, true);
  assertEquals(getDomRef(bodyText) === existingBodyText, true);

  assertEquals(mismatches.length, 0);
});
