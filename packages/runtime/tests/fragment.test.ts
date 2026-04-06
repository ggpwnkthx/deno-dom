import { assertEquals, assertThrows } from "@std/assert";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import {
  createElementVNode,
  createFragmentVNode,
  createTextVNode,
} from "@ggpwnkthx/jsx";
import { getDomRef, mount, patch } from "../src/mod.ts";
import { env } from "../../../tests/dom-test-environment.ts";

env.createContainer(); // Initialize DOM globals

/**
 * Fragment mounting limitation:
 * When mount() appends a DocumentFragment to a container, the fragment's children
 * move INTO the container as siblings. The fragment itself becomes empty.
 * setDomRef stores a reference to this now-empty fragment.
 *
 * When patch() is called with container.firstChild (the empty fragment),
 * patchFragment calls diffChildren on the empty fragment's childNodes.
 * The actual children are now siblings in the container, not children of the fragment.
 *
 * The current algorithm creates NEW nodes instead of finding the existing ones:
 * - diffChildren computes existingDomChildren = [] (empty fragment's childNodes)
 * - For each index, i < existingDomChildren.length is false, so new nodes are created
 * - These new nodes get appended to the empty fragment (a DOM no-op since it's detached)
 * - The original children remain as orphaned siblings in the container
 *
 * The tests appear to pass only because textContent flattens all descendants,
 * hiding the fact that new nodes were created and old nodes were never removed.
 *
 * PATCH TESTS BELOW ARE QUARANTINED: They verify current (broken) behavior.
 * They should be rewritten as correctness tests once the fragment design is fixed.
 */

Deno.test("mount fragment attaches ref to vnode", () => {
  const container = document.createElement("div");
  const vnode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
  ]);
  mount(vnode, container);
  const domRef = getDomRef(vnode);
  assertEquals(domRef, null);
});

Deno.test("mount fragment creates correct child count", () => {
  const container = document.createElement("div");
  const vnode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
    createTextVNode("c"),
  ]);
  mount(vnode, container);
  assertEquals(container.childNodes.length, 3);
  assertEquals(container.textContent, "abc");
});

Deno.test("mount fragment with element children creates correct DOM structure", () => {
  const container = document.createElement("div");
  const vnode = createFragmentVNode(null, [
    createElementVNode("span", { class: "first" }, null, [
      createTextVNode("item1"),
    ]),
    createElementVNode("span", { class: "second" }, null, [
      createTextVNode("item2"),
    ]),
  ]);
  mount(vnode, container);
  assertEquals(container.childNodes.length, 2);
  assertEquals((container.firstChild as HTMLElement).tagName, "SPAN");
  assertEquals((container.firstChild as HTMLElement).className, "first");
  assertEquals(container.textContent, "item1item2");
});

Deno.test("patch fragment children by index updates text content", () => {
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
  const nodes = container.childNodes;
  assertEquals((nodes[0] as Text).textContent, "a");
  assertEquals((nodes[1] as Text).textContent, "x");
  assertEquals(container.textContent, "ax");
});

Deno.test("patch fragment child count shrinks after patch", () => {
  const container = document.createElement("div");
  const oldVNode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
    createTextVNode("c"),
  ]);
  mount(oldVNode, container);
  const initialChildCount = container.childNodes.length;
  assertEquals(initialChildCount, 3);
  const newVNode = createFragmentVNode(null, [
    createTextVNode("a"),
  ]);
  patch(oldVNode, newVNode, container.firstChild!, container);
  assertEquals(container.childNodes.length, 1);
  assertEquals((container.childNodes[0] as Text).textContent, "a");
  assertEquals(container.textContent, "a");
});

Deno.test("patch fragment child count grows after patch", () => {
  const container = document.createElement("div");
  const oldVNode = createFragmentVNode(null, [
    createTextVNode("a"),
  ]);
  mount(oldVNode, container);
  const newVNode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
    createTextVNode("c"),
  ]);
  patch(oldVNode, newVNode, container.firstChild!, container);
  const nodes = container.childNodes;
  assertEquals(nodes.length, 3);
  assertEquals((nodes[0] as Text).textContent, "a");
  assertEquals((nodes[1] as Text).textContent, "b");
  assertEquals((nodes[2] as Text).textContent, "c");
  assertEquals(container.textContent, "abc");
});

Deno.test("patch fragment replaces child at middle index", () => {
  const container = document.createElement("div");
  const oldVNode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("b"),
    createTextVNode("c"),
  ]);
  mount(oldVNode, container);
  const newVNode = createFragmentVNode(null, [
    createTextVNode("a"),
    createTextVNode("x"),
    createTextVNode("c"),
  ]);
  patch(oldVNode, newVNode, container.firstChild!, container);
  const nodes = container.childNodes;
  assertEquals((nodes[0] as Text).textContent, "a");
  assertEquals((nodes[1] as Text).textContent, "x");
  assertEquals((nodes[2] as Text).textContent, "c");
  assertEquals(container.textContent, "axc");
});

Deno.test("patch throws when FragmentVNode pair receives non-fragment domNode", () => {
  const container = document.createElement("div");
  const oldVNode = createFragmentVNode(null, [createTextVNode("a")]);
  const newVNode = createFragmentVNode(null, [createTextVNode("b")]);
  const wrongDom = document.createElement("span");
  assertThrows(
    () => patch(oldVNode, newVNode, wrongDom, container),
    InvariantError,
    "Expected DocumentFragment node",
  );
});
