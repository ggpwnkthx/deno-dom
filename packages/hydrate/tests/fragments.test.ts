import { assertEquals } from "@std/assert";
import { Node } from "@b-fuze/deno-dom";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate } from "../src/hydrate.ts";
import type { MismatchInfo } from "../src/types.ts";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: fragment children advance the parent sibling counter for following elements", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0">First</p><span data-hk="0.1">Second</span><section data-hk="0.2">Third</section></div>';
  const container = env.createSSRContainer(ssrHTML);

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

Deno.test("hydrate decision: fragment text is flattened and preserved before following element", () => {
  const container = env.createSSRContainer(
    '<div data-hk="0">lead<span data-hk="0.0">next</span></div>',
  );

  const lead = createTextVNode("lead");
  const nextText = createTextVNode("next");
  const next = createElementVNode("span", null, null, [nextText]);

  const vnode = createElementVNode("div", null, null, [
    createFragmentVNode(null, [lead]),
    next,
  ]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  const root = container.firstElementChild as HTMLDivElement;
  assertEquals(root.firstChild?.nodeType, Node.TEXT_NODE);
  assertEquals(root.firstChild?.textContent, "lead");
  assertEquals((root.lastChild as Element).getAttribute("data-hk"), "0.0");
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: fragment containing text plus following element gets correct refs", () => {
  const ssrHTML =
    '<div data-hk="0"><span data-hk="0.0">First</span><p data-hk="0.1">Second</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingSpan = existingRoot.childNodes[0] as HTMLSpanElement;
  const existingParagraph = existingRoot.childNodes[1] as HTMLParagraphElement;

  const spanText = createTextVNode("First");
  const pText = createTextVNode("Second");

  const span = createElementVNode("span", null, null, [spanText]);
  const p = createElementVNode("p", null, null, [pText]);

  const vnode = createElementVNode("div", null, null, [
    createFragmentVNode(null, [span]),
    p,
  ]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(getDomRef(span) === existingSpan, true);
  assertEquals(getDomRef(p) === existingParagraph, true);
  assertEquals(getDomRef(spanText) === existingSpan.firstChild, true);
  assertEquals(getDomRef(pText) === existingParagraph.firstChild, true);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: nested fragment flattening preserves text and elements", () => {
  const ssrHTML =
    '<div data-hk="0">a<span data-hk="0.0">b</span>c<p data-hk="0.1">d</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const existingTextA = existingRoot.childNodes[0] as Text;
  const existingSpan = existingRoot.childNodes[1] as HTMLSpanElement;
  const existingTextC = existingRoot.childNodes[2] as Text;
  const existingParagraph = existingRoot.childNodes[3] as HTMLParagraphElement;

  const textA = createTextVNode("a");
  const textB = createTextVNode("b");
  const textC = createTextVNode("c");
  const textD = createTextVNode("d");

  const span = createElementVNode("span", null, null, [textB]);
  const p = createElementVNode("p", null, null, [textD]);

  const innerFragment = createFragmentVNode(null, [textC, p]);
  const outerFragment = createFragmentVNode(null, [textA, span, innerFragment]);

  const vnode = createElementVNode("div", null, null, [outerFragment]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(getDomRef(textA) === existingTextA, true);
  assertEquals(getDomRef(span) === existingSpan, true);
  assertEquals(getDomRef(textB) === existingSpan.firstChild, true);
  assertEquals(getDomRef(textC) === existingTextC, true);
  assertEquals(getDomRef(p) === existingParagraph, true);
  assertEquals(getDomRef(textD) === existingParagraph.firstChild, true);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: nested fragment vnode gets null dom ref", () => {
  const ssrHTML =
    '<div data-hk="0"><span data-hk="0.0">First</span><p data-hk="0.1">Second</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingSpan = container.firstElementChild!.childNodes[0] as HTMLSpanElement;
  const existingParagraph = container.firstElementChild!
    .childNodes[1] as HTMLParagraphElement;

  const spanText = createTextVNode("First");
  const pText = createTextVNode("Second");

  const span = createElementVNode("span", null, null, [spanText]);
  const p = createElementVNode("p", null, null, [pText]);

  const fragment = createFragmentVNode(null, [span, p]);
  const vnode = createElementVNode("div", null, null, [fragment]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(getDomRef(fragment), null);
  assertEquals(getDomRef(span) === existingSpan, true);
  assertEquals(getDomRef(p) === existingParagraph, true);
  assertEquals(getDomRef(spanText) === existingSpan.firstChild, true);
  assertEquals(getDomRef(pText) === existingParagraph.firstChild, true);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: root fragment with existing SSR siblings correctly matches marker paths", () => {
  const ssrHTML = '<span data-hk="0">A</span><p data-hk="1">B</p>';
  const container = env.createSSRContainer(ssrHTML);

  const existingSpan = container.firstElementChild as HTMLSpanElement;
  const existingParagraph = container.lastElementChild as HTMLParagraphElement;

  const spanText = createTextVNode("A");
  const pText = createTextVNode("B");
  const span = createElementVNode("span", null, null, [spanText]);
  const p = createElementVNode("p", null, null, [pText]);

  const fragment = createFragmentVNode(null, [span, p]);
  const mismatches: MismatchInfo[] = [];
  hydrate(fragment, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(container.firstElementChild === existingSpan, true);
  assertEquals(container.lastElementChild === existingParagraph, true);
  assertEquals(getDomRef(span) === existingSpan, true);
  assertEquals(getDomRef(p) === existingParagraph, true);
  assertEquals(getDomRef(spanText) === existingSpan.firstChild, true);
  assertEquals(getDomRef(pText) === existingParagraph.firstChild, true);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: root fragment with nested fragment correctly tracks sibling paths", () => {
  const ssrHTML =
    '<span data-hk="0">A</span><p data-hk="1">B</p><article data-hk="2">C</article>';
  const container = env.createSSRContainer(ssrHTML);

  const existingSpan = container.firstElementChild as HTMLSpanElement;
  const existingParagraph = container.childNodes[1] as HTMLParagraphElement;
  const existingArticle = container.lastElementChild as HTMLElement;

  const spanText = createTextVNode("A");
  const span = createElementVNode("span", null, null, [spanText]);

  const pText = createTextVNode("B");
  const p = createElementVNode("p", null, null, [pText]);

  const articleText = createTextVNode("C");
  const article = createElementVNode("article", null, null, [articleText]);

  const nested = createFragmentVNode(null, [p]);
  const rootFragment = createFragmentVNode(null, [span, nested, article]);

  const mismatches: MismatchInfo[] = [];
  hydrate(rootFragment, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(container.firstElementChild === existingSpan, true);
  assertEquals(container.childNodes[1] === existingParagraph, true);
  assertEquals(container.lastElementChild === existingArticle, true);
  assertEquals(getDomRef(span) === existingSpan, true);
  assertEquals(getDomRef(nested), null);
  assertEquals(getDomRef(p) === existingParagraph, true);
  assertEquals(getDomRef(article) === existingArticle, true);
  assertEquals(mismatches.length, 0);
});
