import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { mount, patch } from "../src/mod.ts";
import { env } from "../../../tests/dom-test-environment.ts";

env.createContainer();

Deno.test("patch diffChildren handles empty old children array", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode("div", null, null, []);
  mount(oldVNode, container);

  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("new child")],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);

  assertEquals(container.textContent, "new child");
});

Deno.test("patch diffChildren handles empty new children array", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("old child")],
  );
  mount(oldVNode, container);

  const newVNode = createElementVNode("div", null, null, []);
  patch(oldVNode, newVNode, container.firstChild!, container);

  assertEquals(container.textContent, "");
});

Deno.test("patch diffChildren handles null in new children array during patch", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("keep"), createTextVNode("remove")],
  );
  mount(oldVNode, container);

  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("keep"), null as unknown as ReturnType<typeof createTextVNode>],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);

  assertEquals(container.textContent, "keep");
});

Deno.test("patch diffChildren removes element when new child is null", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createElementVNode("span", null, null, [createTextVNode("remove me")])],
  );
  mount(oldVNode, container);

  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [null as unknown as ReturnType<typeof createElementVNode>],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);

  assertEquals(container.textContent, "");
});

Deno.test("patch diffChildren updates text in place", () => {
  const container = document.createElement("div");
  const oldVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("old")],
  );
  mount(oldVNode, container);

  const newVNode = createElementVNode(
    "div",
    null,
    null,
    [createTextVNode("new")],
  );
  patch(oldVNode, newVNode, container.firstChild!, container);

  assertEquals(container.textContent, "new");
});
