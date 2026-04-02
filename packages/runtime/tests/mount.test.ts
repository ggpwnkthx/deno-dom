import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert@1.0.19";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "jsr:@ggpwnkthx/jsx@0.1.8";
import { mount } from "../src/mount.ts";
import { getDomRef } from "../src/types.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";

Deno.test("mount creates element in container", () => {
  const container = document.createElement("div");
  const vnode = createElementVNode("div", { class: "test" }, null);
  mount(vnode, container);
  assertEquals(container.innerHTML, '<div class="test"></div>');
});

Deno.test("mount creates text node", () => {
  const container = document.createElement("div");
  const vnode = createTextVNode("hello");
  mount(vnode, container);
  assertEquals(container.textContent, "hello");
});

Deno.test("mount creates nested elements", () => {
  const container = document.createElement("div");
  const vnode = createElementVNode(
    "div",
    { class: "parent" },
    null,
    [createElementVNode("span", null, null, [createTextVNode("child")])],
  );
  mount(vnode, container);
  assertEquals(container.innerHTML, '<div class="parent"><span>child</span></div>');
});

Deno.test("mount creates fragment children", () => {
  const container = document.createElement("div");
  const vnode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
    createTextVNode("c"),
  ]);
  mount(vnode, container);
  assertEquals(container.textContent, "abc");
});

Deno.test("mount attaches DOM ref to vnode", () => {
  const container = document.createElement("div");
  const vnode = createElementVNode("div", null, null);
  mount(vnode, container);
  const domRef = getDomRef(vnode);
  assertInstanceOf(domRef, HTMLElement);
  assertEquals((domRef as HTMLElement).tagName, "DIV");
});

Deno.test("mount applies event handlers", () => {
  const container = document.createElement("div");
  let clicked = false;
  const vnode = createElementVNode("button", {
    onClick: () => {
      clicked = true;
    },
  }, null);
  mount(vnode, container);
  (container.firstChild as HTMLButtonElement).click();
  assertEquals(clicked, true);
});

Deno.test("mount applies props on initial render", () => {
  const container = document.createElement("div");
  const vnode = createElementVNode("input", {
    type: "text",
    value: "test",
    class: "my-input",
  }, null);
  mount(vnode, container);
  const input = container.firstChild as HTMLInputElement;
  assertEquals(input.type, "text");
  assertEquals(input.value, "test");
  assertEquals(input.className, "my-input");
});

Deno.test("mount throws for non-VNode input", () => {
  const container = document.createElement("div");
  assertThrows(
    () => mount(null as unknown as Parameters<typeof mount>[0], container),
    InvariantError,
  );
  assertThrows(
    () => mount({ type: "div" } as Parameters<typeof mount>[0], container),
    InvariantError,
  );
});

Deno.test("mount throws when depth exceeds MAX_MOUNT_DEPTH", () => {
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
  const deepVnode = buildDeepTree(1001);
  assertThrows(
    () => mount(deepVnode, container),
    InvariantError,
    "Max mount depth exceeded",
  );
});

Deno.test("mount handles aria-label attribute", () => {
  const container = document.createElement("div");
  const vnode = createElementVNode("div", { "aria-label": "main" }, null);
  mount(vnode, container);
  assertEquals((container.firstChild as HTMLElement).ariaLabel, "main");
});

Deno.test("mount handles aria-hidden attribute", () => {
  const container = document.createElement("div");
  const vnode = createElementVNode("div", { "aria-hidden": "true" }, null);
  mount(vnode, container);
  assertEquals((container.firstChild as HTMLElement).ariaHidden, "true");
});
