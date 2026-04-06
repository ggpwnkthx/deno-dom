import { assertEquals } from "@std/assert";
import { formatMismatch, formatMismatchKind } from "../src/diagnostics.ts";
import type { MismatchInfo } from "../src/types.ts";
import { env } from "./test-environment.ts";
import { makePath } from "./_shared-test-helpers.ts";

env.createSSRContainer("");

Deno.test("formatMismatchKind returns correct label for tag-mismatch", () => {
  assertEquals(formatMismatchKind("tag-mismatch"), "Tag mismatch");
});

Deno.test("formatMismatchKind returns correct label for marker-mismatch", () => {
  assertEquals(formatMismatchKind("marker-mismatch"), "Hydration marker mismatch");
});

Deno.test("formatMismatchKind returns correct label for type-mismatch", () => {
  assertEquals(formatMismatchKind("type-mismatch"), "Node type mismatch");
});

Deno.test("formatMismatchKind returns correct label for missing-child", () => {
  assertEquals(formatMismatchKind("missing-child"), "Missing child node");
});

Deno.test("formatMismatchKind returns correct label for extra-child", () => {
  assertEquals(formatMismatchKind("extra-child"), "Extra child node");
});

Deno.test("formatMismatchKind returns correct label for extra-text", () => {
  assertEquals(formatMismatchKind("extra-text"), "Extra text node");
});

Deno.test("formatMismatchKind returns fallback for unknown kind", () => {
  assertEquals(
    // deno-lint-ignore no-explicit-any
    formatMismatchKind("unknown" as any),
    "Unknown mismatch",
  );
});

Deno.test("formatMismatch includes expectedPath and actualPath", () => {
  const info: MismatchInfo = {
    kind: "marker-mismatch",
    vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
    domNode: null,
    expectedPath: makePath("0.9"),
    actualPath: makePath("0.9"),
  };
  const msg = formatMismatch(info);
  assertEquals(msg.includes("Hydration marker mismatch"), true);
  assertEquals(msg.includes("0.9"), true);
});

Deno.test("formatMismatch omits actualPath when undefined", () => {
  const info: MismatchInfo = {
    kind: "tag-mismatch",
    vnode: { kind: "element", type: "div", props: null, key: null, children: [] },
    domNode: null,
    expectedPath: makePath("0.0"),
    actualPath: undefined,
  };
  const msg = formatMismatch(info);
  assertEquals(msg.includes("at path 0.0"), true);
  assertEquals(msg.includes("(found path"), false);
});
