import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode, type VNode } from "@ggpwnkthx/jsx";
import { hydrateResult, HydrationError } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

Deno.test("hydrateResult returns ok with valid hydration", () => {
  const ssrHTML = '<div data-hk="0"><h1 data-hk="0.0">Hello</h1></div>';
  const container = env.createSSRContainer(ssrHTML);

  const titleText = createTextVNode("Hello");
  const title = createElementVNode("h1", null, null, [titleText]);
  const vnode = createElementVNode("div", null, null, [title]);

  const result = hydrateResult(vnode, container);

  assertEquals(result.ok, true);
  if (!result.ok) {
    throw new Error("Expected ok result");
  }
  assertEquals(result.value, vnode);
});

Deno.test("hydrateResult returns err for non-VNode input", () => {
  const container = env.createSSRContainer("<div></div>");

  const result = hydrateResult("not a vnode" as unknown as VNode, container);

  assertEquals(result.ok, false);
  if (result.ok) {
    throw new Error("Expected err result");
  }
  assertEquals(result.error instanceof HydrationError, true);
  assertEquals(result.error.code, "INVALID_VNODE");
});

Deno.test("hydrateResult returns err for null input", () => {
  const container = env.createSSRContainer("<div></div>");

  const result = hydrateResult(null as unknown as VNode, container);

  assertEquals(result.ok, false);
  if (result.ok) {
    throw new Error("Expected err result");
  }
  assertEquals(result.error instanceof HydrationError, true);
  assertEquals(result.error.code, "INVALID_VNODE");
});

Deno.test("hydrateResult returns err for object without VNode kind", () => {
  const container = env.createSSRContainer("<div></div>");

  const result = hydrateResult({ type: "div" } as unknown as VNode, container);

  assertEquals(result.ok, false);
  if (result.ok) {
    throw new Error("Expected err result");
  }
  assertEquals(result.error instanceof HydrationError, true);
  assertEquals(result.error.code, "INVALID_VNODE");
});

Deno.test("hydrateResult handles mismatches via onMismatch callback", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">wrong</span></div>';
  const container = env.createSSRContainer(ssrHTML);

  const h1 = createElementVNode("h1", null, null, [createTextVNode("Hello")]);
  const vnode = createElementVNode("div", null, null, [h1]);

  const mismatches: import("@ggpwnkthx/dom-hydrate").MismatchInfo[] = [];
  const result = hydrateResult(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(result.ok, true);
  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0].kind, "tag-mismatch");
});

Deno.test("hydrateResult handles extra children in SSR markup", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0">Extra</p><p data-hk="0.1">Content</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const vnode = createElementVNode("div", null, null, [
    createElementVNode("p", null, null, [createTextVNode("Content")]),
  ]);

  const mismatches: import("@ggpwnkthx/dom-hydrate").MismatchInfo[] = [];
  const result = hydrateResult(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(result.ok, true);
  assertEquals(mismatches.length, 1);
  assertEquals(mismatches[0].kind, "extra-child");
});

Deno.test("hydrateResult handles missing children (creates new DOM)", () => {
  const ssrHTML = '<div data-hk="0"></div>';
  const container = env.createSSRContainer(ssrHTML);

  const vnode = createElementVNode("div", null, null, [
    createElementVNode("span", null, null, [createTextVNode("New")]),
  ]);

  const mismatches: import("@ggpwnkthx/dom-hydrate").MismatchInfo[] = [];
  const result = hydrateResult(vnode, container, {
    onMismatch: (info) => mismatches.push(info),
  });

  assertEquals(result.ok, true);
  assertEquals(mismatches.some((m) => m.kind === "missing-child"), true);
});

Deno.test("HydrationError has correct code and message", () => {
  const ssrHTML = '<div data-hk="0"></div>';
  const container = env.createSSRContainer(ssrHTML);

  const result = hydrateResult("invalid" as unknown as VNode, container);

  if (result.ok) {
    throw new Error("Expected err result");
  }
  const error = result.error;
  assertEquals(error.name, "HydrationError");
  assertEquals(error.code, "INVALID_VNODE");
  assertEquals(error.message, "hydrateResult expects a VNode");
});

Deno.test("hydrateResult returns err with context for invalid input", () => {
  const ssrHTML = '<div data-hk="0"></div>';
  const container = env.createSSRContainer(ssrHTML);

  const badInput = { type: "div" };
  const result = hydrateResult(badInput as unknown as VNode, container);

  if (result.ok) {
    throw new Error("Expected err result");
  }
  assertEquals(result.error.context?.name, "vnode");
  assertEquals(result.error.context?.value, badInput);
});

Deno.test("hydrateResult returns err for deeply nested vnode exceeding MAX_HYDRATE_DEPTH", () => {
  const ssrHTML = '<div data-hk="0"></div>';
  const container = env.createSSRContainer(ssrHTML);

  function buildDeepTree(depth: number): VNode {
    if (depth === 0) {
      return createTextVNode("leaf") as VNode;
    }
    return createElementVNode(
      "div",
      null,
      null,
      [buildDeepTree(depth - 1)],
    ) as VNode;
  }

  const deepVnode = buildDeepTree(1001);
  const result = hydrateResult(deepVnode, container);

  if (result.ok) {
    throw new Error("Expected err result");
  }
  assertEquals(result.error.code, "MAX_DEPTH_EXCEEDED");
  assertEquals(result.error.context?.name, "maxDepth");
});

Deno.test("hydrateResult returns err for non-VNode child in fragment", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.0">Text</p></div>';
  const container = env.createSSRContainer(ssrHTML);

  const vnode = createElementVNode("div", null, null, [
    "not a vnode" as unknown as VNode,
  ]);

  const result = hydrateResult(vnode, container);

  if (result.ok) {
    throw new Error("Expected err result");
  }
  assertEquals(result.error.code, "NON_VNODE_CHILD");
  assertEquals(result.error.context?.name, "childType");
  assertEquals(result.error.context?.value, "string");
});
