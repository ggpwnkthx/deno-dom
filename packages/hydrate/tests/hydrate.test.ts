import { assertEquals } from "@std/assert";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate } from "../src/hydrate.ts";
import type { MismatchInfo } from "../src/types.ts";

function createMockSSRContainer(innerHTML: string): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = innerHTML;
  return container;
}

Deno.test("hydrate decision: exact match preserves existing nodes and attaches DOM refs", () => {
  const ssrHTML =
    '<div data-hk="0"><h1 data-hk="0.0">Hello</h1><p data-hk="0.1">World</p></div>';
  const container = createMockSSRContainer(ssrHTML);

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

Deno.test("hydrate decision: replaces only the mismatched child subtree", () => {
  const ssrHTML =
    '<div data-hk="0"><span data-hk="0.0">Wrong</span><p data-hk="0.1">Keep</p></div>';
  const container = createMockSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const oldWrongChild = existingRoot.firstElementChild as HTMLSpanElement;
  const keptChild = existingRoot.lastElementChild as HTMLParagraphElement;

  const correctedText = createTextVNode("Correct");
  const keptText = createTextVNode("Keep");
  const correctedChild = createElementVNode("p", null, null, [correctedText]);
  const stableChild = createElementVNode("p", null, null, [keptText]);
  const vnode = createElementVNode("div", null, null, [correctedChild, stableChild]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  const currentFirst = currentRoot.firstElementChild as HTMLParagraphElement;
  const currentSecond = currentRoot.lastElementChild as HTMLParagraphElement;

  assertEquals(currentRoot === existingRoot, true);
  assertEquals(currentFirst === oldWrongChild, false);
  assertEquals(currentSecond === keptChild, true);

  assertEquals(currentFirst.tagName, "P");
  assertEquals(currentFirst.textContent, "Correct");
  assertEquals(currentSecond.textContent, "Keep");

  assertEquals(getDomRef(correctedChild) === currentFirst, true);
  assertEquals(getDomRef(stableChild) === keptChild, true);

  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0]?.kind, "tag-mismatch");
  assertEquals(mismatches[0]?.expectedPath, "0.0");
});

Deno.test("hydrate decision: leading text nodes do not affect element hydration paths", () => {
  const ssrHTML =
    '<div data-hk="0">lead<p data-hk="0.0">First</p><p data-hk="0.1">Second</p></div>';
  const container = createMockSSRContainer(ssrHTML);

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

Deno.test("hydrate decision: text child replaces unexpected element with type-mismatch", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">Wrong</span></div>';
  const container = createMockSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const oldChild = existingRoot.firstChild;

  const textChild = createTextVNode("Expected text");
  const vnode = createElementVNode("div", null, null, [textChild]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  const currentChild = currentRoot.firstChild as Text;

  assertEquals(currentRoot === existingRoot, true);
  assertEquals(currentChild === oldChild, false);
  assertEquals(currentChild.nodeType, Node.TEXT_NODE);
  assertEquals(currentChild.textContent, "Expected text");
  assertEquals(getDomRef(textChild) === currentChild, true);

  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0]?.kind, "type-mismatch");
  assertEquals(mismatches[0]?.expectedPath, "0");
});

Deno.test("hydrate decision: comment nodes are ignored when locating matching element children", () => {
  const ssrHTML = '<div data-hk="0"><!--comment--><p data-hk="0.0">First</p></div>';
  const container = createMockSSRContainer(ssrHTML);

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

Deno.test("hydrate decision: fragment children advance the parent sibling counter for following elements", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0">First</p><span data-hk="0.1">Second</span><section data-hk="0.2">Third</section></div>';
  const container = createMockSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingFirst = existingRoot.childNodes[0] as HTMLParagraphElement;
  const existingSecond = existingRoot.childNodes[1] as HTMLSpanElement;
  const existingThird = existingRoot.childNodes[2] as HTMLElement;

  const firstText = createTextVNode("First");
  const secondText = createTextVNode("Second");
  const thirdText = createTextVNode("Third");

  const first = createElementVNode("p", null, null, [firstText]);
  const second = createElementVNode("span", null, null, [secondText]);
  const third = createElementVNode("section", null, null, [thirdText]);

  const vnode = createElementVNode("div", null, null, [
    createFragmentVNode(null, [first, second]),
    third,
  ]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(getDomRef(first) === existingFirst, true);
  assertEquals(getDomRef(second) === existingSecond, true);
  assertEquals(getDomRef(third) === existingThird, true);
  assertEquals(mismatches.length, 0);
});