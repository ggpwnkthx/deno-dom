import { assertEquals } from "@std/assert";
import { parseHydrationPathFromString } from "@ggpwnkthx/dom-shared";
import {
  isMismatchExtra,
  isMismatchInfo,
  isMismatchWithVNode,
  type MismatchInfo,
} from "../src/types.ts";
import { env } from "./test-environment.ts";

env.createSSRContainer("");

function makePath(segments: string): import("@ggpwnkthx/dom-shared").HydrationPath {
  const result = parseHydrationPathFromString(segments);
  if (!result) throw new Error(`Invalid hydration path: ${segments}`);
  return result;
}

Deno.test("isMismatchInfo returns true for valid tag-mismatch", () => {
  const info: MismatchInfo = {
    kind: "tag-mismatch",
    vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
    domNode: null,
    expectedPath: makePath("0.0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchInfo(info), true);
});

Deno.test("isMismatchInfo returns true for valid extra-child", () => {
  const info: MismatchInfo = {
    kind: "extra-child",
    vnode: null,
    domNode: {} as Node,
    expectedPath: makePath("0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchInfo(info), true);
});

Deno.test("isMismatchInfo returns false for null", () => {
  assertEquals(isMismatchInfo(null), false);
});

Deno.test("isMismatchInfo returns false for primitive", () => {
  assertEquals(isMismatchInfo("tag-mismatch"), false);
  assertEquals(isMismatchInfo(42), false);
});

Deno.test("isMismatchInfo returns false for object missing kind", () => {
  // deno-lint-ignore no-explicit-any
  assertEquals(isMismatchInfo({ expectedPath: makePath("0") } as any), false);
});

Deno.test("isMismatchInfo returns false for unknown kind", () => {
  assertEquals(
    isMismatchInfo({
      kind: "unknown-kind",
      expectedPath: makePath("0"),
    }),
    false,
  );
});

Deno.test("isMismatchInfo returns false for malformed expectedPath", () => {
  assertEquals(
    isMismatchInfo({
      kind: "tag-mismatch",
      vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
      domNode: null,
      // deno-lint-ignore no-explicit-any
      expectedPath: "not-a-valid-path" as any,
      actualPath: undefined,
    }),
    false,
  );
});

Deno.test("isMismatchInfo returns false for missing expectedPath", () => {
  assertEquals(
    isMismatchInfo({
      kind: "tag-mismatch",
      vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
      domNode: null,
      actualPath: undefined,
    }),
    false,
  );
});

Deno.test("isMismatchWithVNode returns true for tag-mismatch", () => {
  const info: MismatchInfo = {
    kind: "tag-mismatch",
    vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
    domNode: null,
    expectedPath: makePath("0.0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchWithVNode(info), true);
});

Deno.test("isMismatchWithVNode returns false for extra-child", () => {
  const info: MismatchInfo = {
    kind: "extra-child",
    vnode: null,
    domNode: {} as Node,
    expectedPath: makePath("0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchWithVNode(info), false);
});

Deno.test("isMismatchExtra returns true for extra-child", () => {
  const info: MismatchInfo = {
    kind: "extra-child",
    vnode: null,
    domNode: {} as Node,
    expectedPath: makePath("0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchExtra(info), true);
});

Deno.test("isMismatchExtra returns true for extra-text", () => {
  const info: MismatchInfo = {
    kind: "extra-text",
    vnode: null,
    domNode: {} as Node,
    expectedPath: makePath("0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchExtra(info), true);
});

Deno.test("isMismatchExtra returns false for tag-mismatch", () => {
  const info: MismatchInfo = {
    kind: "tag-mismatch",
    vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
    domNode: null,
    expectedPath: makePath("0.0"),
    actualPath: undefined,
  };
  assertEquals(isMismatchExtra(info), false);
});
