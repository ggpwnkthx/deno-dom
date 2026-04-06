import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { getDomRef } from "@ggpwnkthx/dom-runtime";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

Deno.test("hydrate decision: no-SSR fallback creates fresh DOM for element root and sets dom ref", () => {
  const container = env.createSSRContainer("");

  const innerText = createTextVNode("Fresh content");
  const inner = createElementVNode("p", { class: "fresh" }, null, [innerText]);
  const vnode = createElementVNode("div", { id: "root" }, null, [inner]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => {
      mismatches.push(info);
    },
  });

  const currentRoot = container.firstElementChild as HTMLDivElement;
  assertEquals(currentRoot.tagName, "DIV");
  assertEquals(currentRoot.id, "root");
  assertEquals(getDomRef(vnode) === currentRoot, true);

  const currentInner = currentRoot.firstElementChild as HTMLParagraphElement;
  assertEquals(currentInner.tagName, "P");
  assertEquals(currentInner.className, "fresh");
  assertEquals(getDomRef(inner) === currentInner, true);

  const currentText = currentInner.firstChild as Text;
  assertEquals(currentText.textContent, "Fresh content");
  assertEquals(getDomRef(innerText) === currentText, true);

  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: no-SSR fallback for deeply nested element tree", () => {
  const container = env.createSSRContainer("");

  const vnode = createElementVNode("div", null, null, [
    createElementVNode("section", null, null, [
      createElementVNode("article", null, null, [
        createTextVNode("Deep content"),
      ]),
    ]),
  ]);

  hydrate(vnode, container);

  const currentRoot = container.firstElementChild as HTMLDivElement;
  assertEquals(currentRoot.tagName, "DIV");

  const section = currentRoot.firstElementChild as HTMLElement;
  assertEquals(section.tagName, "SECTION");

  const article = section.firstElementChild as HTMLElement;
  assertEquals(article.tagName, "ARTICLE");

  const text = article.firstChild as Text;
  assertEquals(text.textContent, "Deep content");
});
