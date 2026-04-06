import { assertEquals } from "@std/assert";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { getDomRef, removeDomRef, setDomRef } from "../src/types.ts";
import { env } from "../../../tests/dom-test-environment.ts";

env.createContainer();

Deno.test("getDomRef returns null for vnode never mounted", () => {
  const vnode = createElementVNode("div", null, null);
  assertEquals(getDomRef(vnode), null);
});

Deno.test("setDomRef stores ref and getDomRef retrieves it", () => {
  const vnode = createElementVNode("div", null, null);
  const el = document.createElement("div");
  setDomRef(vnode, el);
  assertEquals(getDomRef(vnode) === el, true);
});

Deno.test("setDomRef overwrites previous ref", () => {
  const vnode = createElementVNode("div", null, null);
  const el1 = document.createElement("div");
  const el2 = document.createElement("div");
  setDomRef(vnode, el1);
  setDomRef(vnode, el2);
  assertEquals(getDomRef(vnode) === el2, true);
});

Deno.test("removeDomRef clears the ref", () => {
  const vnode = createElementVNode("div", null, null);
  const el = document.createElement("div");
  setDomRef(vnode, el);
  removeDomRef(vnode);
  assertEquals(getDomRef(vnode), null);
});

Deno.test("getDomRef returns null after removeDomRef even if set multiple times", () => {
  const vnode = createElementVNode("div", null, null);
  setDomRef(vnode, document.createElement("div"));
  setDomRef(vnode, document.createElement("div"));
  removeDomRef(vnode);
  assertEquals(getDomRef(vnode), null);
});

Deno.test("getDomRef returns null for never-mounted fragment", () => {
  const fragment = createFragmentVNode(null, [createTextVNode("a")]);
  assertEquals(getDomRef(fragment), null);
});
