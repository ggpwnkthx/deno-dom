import { assertEquals } from "@std/assert@1.0.19";
import { hydrate } from "../src/hydrate.ts";
import { createElementVNode, createTextVNode } from "jsr:@ggpwnkthx/jsx@0.1.8";
import { parseHydrationPath } from "@ggpwnkthx/dom-shared";
import type { MismatchInfo } from "../src/types.ts";

function createMockSSRContainer(innerHTML: string): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = innerHTML;
  return container;
}

Deno.test("hydrate: happy path with simple element", () => {
  const ssrHTML =
    '<div data-hk="0"><h1 data-hk="0.0">Hello</h1><p data-hk="0.1">World</p></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("h1", null, null, [createTextVNode("Hello")]),
      createElementVNode("p", null, null, [createTextVNode("World")]),
    ],
  );

  const result = hydrate(vnode, container);

  assertEquals(result, vnode);
  assertEquals(container.querySelector("h1")?.textContent, "Hello");
  assertEquals(container.querySelector("p")?.textContent, "World");
});

Deno.test("hydrate: text node alignment", () => {
  const ssrHTML = '<div data-hk="0">Hello World</div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode("div", null, null, [createTextVNode("Hello World")]);

  hydrate(vnode, container);

  assertEquals(container.querySelector("div")?.firstChild?.nodeType, Node.TEXT_NODE);
});

Deno.test("hydrate: rebinds event handlers", () => {
  const ssrHTML = '<button data-hk="0">Click me</button>';
  const container = createMockSSRContainer(ssrHTML);

  let clickCount = 0;
  const vnode = createElementVNode(
    "button",
    { onClick: () => clickCount++ },
    null,
    [createTextVNode("Click me")],
  );

  hydrate(vnode, container);

  const button = container.querySelector("button") as HTMLButtonElement;
  button.click();

  assertEquals(clickCount, 1);
});

Deno.test("hydrate: replaces subtree on tag mismatch", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">Wrong tag</span></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Correct tag")]),
    ],
  );

  hydrate(vnode, container);

  const div = container.querySelector("div");
  const firstChild = div?.firstChild;
  assertEquals(firstChild?.nodeType, Node.ELEMENT_NODE);
  assertEquals((firstChild as Element).tagName.toLowerCase(), "p");
});

Deno.test("hydrate: replaces subtree on marker mismatch", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.1">Wrong position</p></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Correct position")]),
    ],
  );

  hydrate(vnode, container);

  const div = container.querySelector("div");
  const firstChild = div?.firstChild;
  assertEquals((firstChild as Element).getAttribute("data-hk"), "0.0");
});

Deno.test("hydrate: handles nested elements", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0">First</p><span data-hk="0.1">Second</span></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("First")]),
      createElementVNode("span", null, null, [createTextVNode("Second")]),
    ],
  );

  hydrate(vnode, container);

  assertEquals(container.querySelector("p")?.textContent, "First");
  assertEquals(container.querySelector("span")?.textContent, "Second");
});

Deno.test("hydrate: onMismatch callback receives correct MismatchInfo for tag mismatch", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">Wrong tag</span></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Expected")]),
    ],
  );

  const infos: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info: MismatchInfo) => {
      infos.push(info);
    },
  });

  assertEquals(infos.length > 0, true);
  const info = infos[0] as MismatchInfo;
  assertEquals(info.kind, "tag-mismatch");
  assertEquals(info.expectedPath, "0.0");
  assertEquals(info.vnode?.kind, "element");
});

Deno.test("hydrate: detects extra child element", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0">Valid</p><span data-hk="0.1">Extra</span></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Valid")]),
    ],
  );

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => {
      mismatches.push(info);
    },
  });

  assertEquals(mismatches.length, 1);
  const first = mismatches[0];
  assertEquals(first.kind, "extra-child");
  assertEquals(first.expectedPath, "0");
});

Deno.test("hydrate: detects extra text node", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.0">Valid</p>extra text</div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Valid")]),
    ],
  );

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info) => {
      mismatches.push(info);
    },
  });

  const hasExtraText = mismatches.some((m) => m.kind === "extra-text");
  assertEquals(hasExtraText, true);
});

Deno.test("hydrate: extra nodes are removed from DOM after mismatch", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0">Valid</p><span data-hk="0.1">Extra</span></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Valid")]),
    ],
  );

  hydrate(vnode, container);

  assertEquals(container.querySelector("span"), null);
  assertEquals(container.querySelector("p")?.textContent, "Valid");
});

Deno.test("hydrate: onMismatch callback receives correct fields for missing-child", () => {
  const ssrHTML = '<div data-hk="0"></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Missing")]),
    ],
  );

  const infos: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info: MismatchInfo) => {
      infos.push(info);
    },
  });

  assertEquals(infos.length > 0, true);
  const info = infos[0] as MismatchInfo;
  assertEquals(info.kind, "missing-child");
  assertEquals(info.expectedPath, "0.0");
  assertEquals(info.vnode?.kind, "element");
});

Deno.test("hydrate: onMismatch callback receives correct fields for marker-mismatch", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.1">Wrong position</p></div>';
  const container = createMockSSRContainer(ssrHTML);

  const vnode = createElementVNode(
    "div",
    null,
    null,
    [
      createElementVNode("p", null, null, [createTextVNode("Correct position")]),
    ],
  );

  const infos: MismatchInfo[] = [];
  hydrate(vnode, container, {
    onMismatch: (info: MismatchInfo) => {
      infos.push(info);
    },
  });

  assertEquals(infos.length > 0, true);
  const info = infos[0] as MismatchInfo;
  assertEquals(info.kind, "marker-mismatch");
  assertEquals(info.expectedPath, "0.0");
  assertEquals(info.actualPath, "0.1");
});

Deno.test("parseHydrationPath: extracts path from element", () => {
  const el = document.createElement("div");
  el.setAttribute("data-hk", "0.1.2");

  const result = parseHydrationPath(el);
  assertEquals(result, "0.1.2");
});

Deno.test("parseHydrationPath: returns null when no marker", () => {
  const el = document.createElement("div");

  assertEquals(parseHydrationPath(el), null);
});
