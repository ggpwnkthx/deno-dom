import { assertEquals, assertThrows } from "@std/assert";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { mount, patch } from "../src/mod.ts";
import { env } from "../../../tests/dom-test-environment.ts";

env.createContainer(); // Initialize DOM globals

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
  (container.firstChild as HTMLButtonElement).dispatchEvent(
    new Event("click", { bubbles: true }),
  );
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
