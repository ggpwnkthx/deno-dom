import { assertEquals } from "@std/assert";
import { DOMParser, Node } from "@b-fuze/deno-dom";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate } from "../src/hydrate.ts";
import type { MismatchInfo } from "../src/types.ts";

class TestEnvironment {
  private static initialized = false;

  private static init(): void {
    if (this.initialized) return;
    this.initialized = true;
    const doc = new DOMParser().parseFromString(
      "<html><body></body></html>",
      "text/html",
    );
    // deno-lint-ignore no-explicit-any
    (globalThis as any).Node = Node;
    // deno-lint-ignore no-explicit-any
    (globalThis as any).document = doc;
  }

  createSSRContainer(innerHTML: string): HTMLDivElement {
    TestEnvironment.init();
    const doc = new DOMParser().parseFromString(
      `<body><div>${innerHTML}</div></body>`,
      "text/html",
    );
    const firstChild = doc.body.firstChild;
    if (!firstChild) {
      throw new Error("Failed to parse HTML: body.firstChild is null");
    }
    // @ts-expect-error - HTML structure guarantees firstChild is a div element
    return firstChild;
  }
}

const env = new TestEnvironment();

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

Deno.test("hydrate decision: replaces only the mismatched child subtree", () => {
  const ssrHTML =
    '<div data-hk="0"><span data-hk="0.0">Wrong</span><p data-hk="0.1">Keep</p></div>';
  const container = env.createSSRContainer(ssrHTML);

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

Deno.test("hydrate decision: text child replaces unexpected element with type-mismatch", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">Wrong</span></div>';
  const container = env.createSSRContainer(ssrHTML);

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

Deno.test("hydrate decision: replaceWith creates deep nested children via createDomDeep", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">Wrong</span></div>';
  const container = env.createSSRContainer(ssrHTML);

  const level1 = createElementVNode("div", null, null, [
    createElementVNode("section", null, null, [
      createElementVNode("article", null, null, [
        createTextVNode("Deep content"),
      ]),
    ]),
  ]);
  const vnode = createElementVNode("div", null, null, [level1]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  assertEquals(currentRoot.childNodes.length, 1);
  const replacedDiv = currentRoot.firstElementChild as HTMLElement;
  assertEquals(replacedDiv.tagName, "DIV");
  assertEquals(getDomRef(level1) === replacedDiv, true);

  const section = replacedDiv.firstElementChild as HTMLElement;
  assertEquals(section.tagName, "SECTION");

  const article = section.firstElementChild as HTMLElement;
  assertEquals(article.tagName, "ARTICLE");

  const text = article.firstChild as Text;
  assertEquals(text.textContent, "Deep content");
  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0]?.kind, "tag-mismatch");
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
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  assertEquals(existingParagraph.firstChild === existingTextNode, true);
  assertEquals(existingTextNode.textContent, "New text");
  assertEquals(getDomRef(newText) === existingTextNode, true);
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
