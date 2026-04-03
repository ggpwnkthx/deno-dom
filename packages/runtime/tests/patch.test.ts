import { assertEquals, assertThrows } from "@std/assert";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { mount, patch } from "../src/mod.ts";

Deno.test("patch updates text content", () => {
  const container = document.createElement("div");
  const oldVNode = createTextVNode("old");
  mount(oldVNode, container);
  assertEquals(container.textContent, "old");
  const newVNode = createTextVNode("new");
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals(container.textContent, "new");
});

Deno.test("patch updates element class", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { class: "old-class" }, null);
  mount(oldVNode, container);
  assertEquals((container.firstChild as HTMLElement).className, "old-class");
  const newVNode = createElementVNode("div", { class: "new-class" }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLElement).className, "new-class");
});

Deno.test("patch removes stale props", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { class: "my-class", id: "my-id" }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("div", { class: "my-class" }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  const el = container.firstChild as HTMLElement;
  assertEquals(el.className, "my-class");
  assertEquals(el.id, "");
});

Deno.test("patch updates event handlers", () => {
  const container = document.createElement("div");
  let handler1Called = false;
  let handler2Called = false;
  const oldVNode = createElementVNode("button", {
    onClick: () => {
      handler1Called = true;
    },
  }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("button", {
    onClick: () => {
      handler2Called = true;
    },
  }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  (container.firstChild as HTMLButtonElement).click();
  assertEquals(handler1Called, false);
  assertEquals(handler2Called, true);
});

Deno.test("patch replaces element when type changes", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { class: "test" }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("span", { class: "test" }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as Element).tagName, "SPAN");
});

Deno.test("patch updates children by index", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("a"), createTextVNode("b"), createTextVNode("c")],
  );
  mount(oldVNode, container);
  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("a"), createTextVNode("x"), createTextVNode("c")],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals(container.textContent, "axc");
});

Deno.test("patch removes child at index", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("a"), createTextVNode("b"), createTextVNode("c")],
  );
  mount(oldVNode, container);
  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("a"), createTextVNode("c")],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals(container.textContent, "ac");
});

Deno.test("patch adds child at end", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("a"), createTextVNode("b")],
  );
  mount(oldVNode, container);
  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("a"), createTextVNode("b"), createTextVNode("c")],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals(container.textContent, "abc");
});

Deno.test("patch handles fragment children", () => {
  const container = document.createElement("div");
  const oldVNode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
  ]);
  mount(oldVNode, container);
  const newVNode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("x"),
  ]);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals(container.textContent, "ax");
});

Deno.test("patch returns new DOM node when replaced", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", null, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("span", null, null);
  const result = patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((result as Element).tagName, "SPAN");
});

Deno.test("patch handles data attributes", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { "data-id": "old" }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("div", { "data-id": "new" }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLElement).dataset["id"], "new");
});

Deno.test("patch handles boolean attributes", () => {
  const container = document.createElement("input");
  const oldVNode = createElementVNode(
    "input",
    { type: "checkbox", checked: false },
    null,
  );
  mount(oldVNode, container);
  const newVNode = createElementVNode(
    "input",
    { type: "checkbox", checked: true },
    null,
  );
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLInputElement).checked, true);
});

Deno.test("patch handles value property", () => {
  const container = document.createElement("input");
  const oldVNode = createElementVNode("input", { type: "text", value: "old" }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("input", { type: "text", value: "new" }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLInputElement).value, "new");
});

Deno.test("patch handles style updates", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { style: { color: "red" } }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("div", { style: { color: "blue" } }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLElement).style.color, "blue");
});

Deno.test("patch throws when depth exceeds MAX_PATCH_DEPTH", () => {
  function buildDeepTree(depth: number): Parameters<typeof mount>[0] {
    if (depth === 0) {
      return createTextVNode("leaf") as Parameters<typeof mount>[0];
    }
    return createElementVNode(
      "div",
      null,
      null,
      [buildDeepTree(depth - 1)],
    ) as Parameters<typeof mount>[0];
  }
  const container = document.createElement("div");
  const oldVNode = buildDeepTree(1001);
  mount(oldVNode, container);
  const newVNode = buildDeepTree(1001);
  assertThrows(
    () => patch(oldVNode, newVNode, container.firstChild!, container),
    InvariantError,
    "Max patch depth exceeded",
  );
});

Deno.test("patch throws for non-VNode oldVNode", () => {
  const container = document.createElement("div");
  const validVNode = createElementVNode("div", null, null);
  mount(validVNode, container);
  assertThrows(
    () =>
      patch(
        null as unknown as Parameters<typeof patch>[0],
        validVNode,
        container.firstChild!,
        container,
      ),
    InvariantError,
    "patch expects oldVNode to be a VNode",
  );
});

Deno.test("patch throws for non-VNode newVNode", () => {
  const container = document.createElement("div");
  const validVNode = createElementVNode("div", null, null);
  mount(validVNode, container);
  assertThrows(
    () =>
      patch(
        validVNode,
        null as unknown as Parameters<typeof patch>[1],
        container.firstChild!,
        container,
      ),
    InvariantError,
    "patch expects newVNode to be a VNode",
  );
});

Deno.test("patch removes aria-label attribute", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { "aria-label": "main" }, null);
  mount(oldVNode, container);
  assertEquals((container.firstChild as HTMLElement).ariaLabel, "main");
  const newVNode = createElementVNode("div", null, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLElement).ariaLabel, "");
});

Deno.test("patch updates aria-label attribute", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", { "aria-label": "old" }, null);
  mount(oldVNode, container);
  const newVNode = createElementVNode("div", { "aria-label": "new" }, null);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals((container.firstChild as HTMLElement).ariaLabel, "new");
});
