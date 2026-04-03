import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate } from "../src/hydrate.ts";
import type { MismatchInfo } from "../src/types.ts";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: comment nodes are ignored when locating matching element children", () => {
  const ssrHTML = '<div data-hk="0"><!--comment--><p data-hk="0.0">First</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingComment = existingRoot.firstChild as Comment;
  const existingParagraph = existingRoot.lastChild as HTMLParagraphElement;

  const paragraphText = createTextVNode("First");
  const paragraph = createElementVNode("p", null, null, [paragraphText]);
  const vnode = createElementVNode("div", null, null, [paragraph]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(existingRoot.firstChild === existingComment, true);
  assertEquals(existingRoot.lastChild === existingParagraph, true);
  assertEquals(existingComment.nodeType, Node.COMMENT_NODE);
  assertEquals(getDomRef(paragraph) === existingParagraph, true);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: comment node skipped and later mismatch triggers onMismatch with exact path", () => {
  const ssrHTML =
    '<div data-hk="0"><!--comment--><span data-hk="0.0">Correct</span></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingComment = existingRoot.firstChild as Comment;
  const existingSpan = existingRoot.lastChild as HTMLSpanElement;

  const wrongText = createTextVNode("Wrong");
  const wrongSpan = createElementVNode("div", null, null, [wrongText]);
  const vnode = createElementVNode("div", null, null, [wrongSpan]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(existingRoot.firstChild === existingComment, true);
  assertEquals(existingComment.nodeType, Node.COMMENT_NODE);
  assertEquals(existingRoot.lastChild === existingSpan, false);

  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0]?.kind, "tag-mismatch");
  assertEquals(mismatches[0]?.expectedPath, "0.0");
  assertEquals(mismatches[0]?.domNode === existingSpan, true);
});
