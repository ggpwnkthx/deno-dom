import { assertEquals } from "@std/assert";
import { Node } from "@b-fuze/deno-dom";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";
import { makePath } from "./_shared-test-helpers.ts";

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
  assertEquals(mismatches[0]?.expectedPath, makePath("0.0"));
});

Deno.test("hydrate decision: type-mismatch when text vnode meets element node", () => {
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
  assertEquals(mismatches[0]?.expectedPath, makePath("0"));
});

Deno.test("hydrate decision: marker-mismatch when data-hk does not match expected path", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.9">Content</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;
  const vnode = createElementVNode("div", null, null, [
    createElementVNode("p", null, null, [createTextVNode("Content")]),
  ]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  const currentFirst = currentRoot.firstElementChild as HTMLParagraphElement;

  assertEquals(currentRoot === existingRoot, true);
  assertEquals(currentFirst.tagName, "P");
  assertEquals(currentFirst.textContent, "Content");

  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0]?.kind, "marker-mismatch");
  assertEquals(mismatches[0]?.expectedPath, makePath("0.0"));
  assertEquals(mismatches[0]?.actualPath, makePath("0.9"));
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
