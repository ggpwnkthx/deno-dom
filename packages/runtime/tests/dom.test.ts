import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert@1.0.19";
import { createElementVNode, createTextVNode } from "jsr:@ggpwnkthx/jsx@0.1.8";
import {
  createDom,
  removeProp,
  replaceNode,
  setProp,
  setText,
} from "../src/dom/create.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";

Deno.test("createDom creates text node from TextVNode", () => {
  const vnode = createTextVNode("hello");
  const node = createDom(vnode);
  assertInstanceOf(node, Text);
  assertEquals(node.textContent, "hello");
});

Deno.test("createDom creates element from ElementVNode", () => {
  const vnode = createElementVNode("div", { class: "test" }, null);
  const el = createDom(vnode);
  assertInstanceOf(el, HTMLElement);
  assertEquals(el.tagName, "DIV");
  assertEquals(el.className, "test");
});

Deno.test("createDom throws for ComponentVNode", () => {
  const vnode = {
    kind: "component",
    type: () => ({
      kind: "element",
      type: "div",
      props: null,
      key: null,
      children: [],
    }),
    props: null,
    key: null,
    children: [],
  };
  assertThrows(
    () => createDom(vnode as Parameters<typeof createDom>[0]),
    InvariantError,
    "ComponentVNode should not reach DOM creation",
  );
});

Deno.test("setProp sets class attribute", () => {
  const el = document.createElement("div");
  setProp(el, "class", "my-class");
  assertEquals(el.className, "my-class");
});

Deno.test("setProp sets id attribute", () => {
  const el = document.createElement("div");
  setProp(el, "id", "my-id");
  assertEquals(el.id, "my-id");
});

Deno.test("setProp sets id attribute from number", () => {
  const el = document.createElement("div");
  setProp(el, "id", 42);
  assertEquals(el.id, "42");
});

Deno.test("setProp sets data attribute", () => {
  const el = document.createElement("div");
  setProp(el, "data-id", "123");
  assertEquals((el as HTMLElement).dataset["id"], "123");
});

Deno.test("setProp sets boolean attribute", () => {
  const el = document.createElement("input");
  el.setAttribute("disabled", "false");
  setProp(el, "disabled", true);
  assertEquals(el.hasAttribute("disabled"), true);
});

Deno.test("setProp sets style object", () => {
  const el = document.createElement("div");
  setProp(el, "style", { color: "red", fontSize: "14px" });
  assertEquals((el as HTMLElement).style.color, "red");
});

Deno.test("removeProp removes class", () => {
  const el = document.createElement("div");
  el.className = "my-class";
  removeProp(el, "class", "my-class");
  assertEquals(el.className, "");
});

Deno.test("removeProp removes id attribute", () => {
  const el = document.createElement("div");
  el.id = "my-id";
  removeProp(el, "id", "my-id");
  assertEquals(el.id, "");
});

Deno.test("setText updates text content", () => {
  const textNode = document.createTextNode("old");
  setText(textNode, "new");
  assertEquals(textNode.textContent, "new");
});

Deno.test("setText handles numbers", () => {
  const textNode = document.createTextNode("old");
  setText(textNode, 42);
  assertEquals(textNode.textContent, "42");
});

Deno.test("replaceNode replaces DOM node", () => {
  const container = document.createElement("div");
  const oldNode = document.createElement("span");
  oldNode.textContent = "old";
  const newNode = document.createElement("p");
  newNode.textContent = "new";
  container.appendChild(oldNode);
  replaceNode(oldNode, newNode);
  assertEquals(container.innerHTML, "<p>new</p>");
});

Deno.test("setProp sets aria-label attribute", () => {
  const el = document.createElement("div");
  setProp(el, "aria-label", "main");
  assertEquals((el as HTMLElement).ariaLabel, "main");
});

Deno.test("setProp sets aria-hidden attribute", () => {
  const el = document.createElement("div");
  setProp(el, "aria-hidden", "true");
  assertEquals((el as HTMLElement).ariaHidden, "true");
});

Deno.test("removeProp removes aria-label attribute", () => {
  const el = document.createElement("div");
  (el as HTMLElement).ariaLabel = "main";
  removeProp(el, "aria-label", "main");
  assertEquals((el as HTMLElement).ariaLabel, "");
});
