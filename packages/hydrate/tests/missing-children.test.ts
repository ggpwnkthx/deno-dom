import { assertEquals } from "@std/assert";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: missing nested subtree is recreated deeply via createDomDeep", () => {
  const ssrHTML = '<div data-hk="0"></div>';
  const container = env.createSSRContainer(ssrHTML);

  const existingRoot = container.firstElementChild as HTMLDivElement;

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
  assertEquals(currentRoot === existingRoot, true);

  assertEquals(currentRoot.childNodes.length, 1);

  const newChild = currentRoot.firstElementChild as HTMLElement;
  assertEquals(newChild.tagName, "DIV");
  assertEquals(getDomRef(level1) === newChild, true);

  const section = newChild.firstElementChild as HTMLElement;
  assertEquals(section.tagName, "SECTION");

  const article = section.firstElementChild as HTMLElement;
  assertEquals(article.tagName, "ARTICLE");

  const text = article.firstChild as Text;
  assertEquals(text.textContent, "Deep content");

  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0]?.kind, "missing-child");
});

Deno.test("hydrate decision: no-SSR fallback with fragment root creates deep DOM and null ref", () => {
  const container = env.createSSRContainer("");

  const level1 = createElementVNode("div", null, null, [
    createElementVNode("section", null, null, [
      createTextVNode("Deep content"),
    ]),
  ]);
  const vnode = createFragmentVNode(null, [level1]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  assertEquals(currentRoot.tagName, "DIV");
  assertEquals(getDomRef(vnode), null);
  assertEquals(getDomRef(level1) === currentRoot, true);

  const section = currentRoot.firstElementChild as HTMLElement;
  assertEquals(section.tagName, "SECTION");

  const text = section.firstChild as Text;
  assertEquals(text.textContent, "Deep content");
  assertEquals(mismatches.length, 0);
});
