import { assertEquals } from "@std/assert";
import {
  buildHydrationPath,
  isHydrationPath,
  parseHydrationPath,
  parseHydrationPathFromString,
} from "../src/hydration.ts";
import { env } from "../../../tests/dom-test-environment.ts";

env.createContainer();

Deno.test("isHydrationPath returns true for simple path", () => {
  assertEquals(isHydrationPath("0"), true);
  assertEquals(isHydrationPath("1"), true);
  assertEquals(isHydrationPath("10"), true);
});

Deno.test("isHydrationPath returns true for nested path", () => {
  assertEquals(isHydrationPath("0.0"), true);
  assertEquals(isHydrationPath("0.1"), true);
  assertEquals(isHydrationPath("0.0.0"), true);
  assertEquals(isHydrationPath("1.2.3.4.5"), true);
});

Deno.test("isHydrationPath returns false for invalid paths", () => {
  assertEquals(isHydrationPath(""), false);
  assertEquals(isHydrationPath("a"), false);
  assertEquals(isHydrationPath("0."), false);
  assertEquals(isHydrationPath(".0"), false);
  assertEquals(isHydrationPath("0..0"), false);
  assertEquals(isHydrationPath("-1"), false);
  assertEquals(isHydrationPath("0.-1"), false);
});

Deno.test("buildHydrationPath with null parent returns simple index", () => {
  assertEquals(buildHydrationPath(null, 0), "0");
  assertEquals(buildHydrationPath(null, 1), "1");
  assertEquals(buildHydrationPath(null, 10), "10");
});

Deno.test("buildHydrationPath with parent path returns nested path", () => {
  const el0 = document.createElement("div");
  const el00 = document.createElement("div");
  el0.setAttribute("data-hk", "0");
  el00.setAttribute("data-hk", "0.0");
  const p0 = parseHydrationPath(el0)!;
  const p00 = parseHydrationPath(el00)!;
  assertEquals(buildHydrationPath(p0, 0), "0.0");
  assertEquals(buildHydrationPath(p0, 1), "0.1");
  assertEquals(buildHydrationPath(p00, 0), "0.0.0");
  assertEquals(buildHydrationPath(p00, 5), "0.0.5");
});

Deno.test("parseHydrationPath returns path for element with data-hk", () => {
  const el = document.createElement("div");
  el.setAttribute("data-hk", "0.0");
  assertEquals(parseHydrationPath(el), "0.0");
});

Deno.test("parseHydrationPath returns path for deeply nested element", () => {
  const el = document.createElement("div");
  el.setAttribute("data-hk", "0.1.2.3.4");
  assertEquals(parseHydrationPath(el), "0.1.2.3.4");
});

Deno.test("parseHydrationPath returns null when data-hk absent", () => {
  const el = document.createElement("div");
  assertEquals(parseHydrationPath(el), null);
});

Deno.test("parseHydrationPath returns null for invalid marker value", () => {
  const el = document.createElement("div");
  el.setAttribute("data-hk", "not a path");
  assertEquals(parseHydrationPath(el), null);
});

Deno.test("parseHydrationPath returns null for empty marker value", () => {
  const el = document.createElement("div");
  el.setAttribute("data-hk", "");
  assertEquals(parseHydrationPath(el), null);
});

Deno.test("parseHydrationPathFromString returns path for valid string", () => {
  assertEquals(parseHydrationPathFromString("0"), "0");
  assertEquals(parseHydrationPathFromString("0.0"), "0.0");
  assertEquals(parseHydrationPathFromString("1.2.3.4.5"), "1.2.3.4.5");
});

Deno.test("parseHydrationPathFromString returns null for invalid string", () => {
  assertEquals(parseHydrationPathFromString(""), null);
  assertEquals(parseHydrationPathFromString("a"), null);
  assertEquals(parseHydrationPathFromString("0."), null);
  assertEquals(parseHydrationPathFromString(".0"), null);
  assertEquals(parseHydrationPathFromString("0..0"), null);
  assertEquals(parseHydrationPathFromString("-1"), null);
  assertEquals(parseHydrationPathFromString("not-a-path"), null);
});

Deno.test("buildHydrationPath throws for invalid constructed path", () => {
  let threw = false;
  let message = "";
  try {
    // deno-lint-ignore no-explicit-any
    buildHydrationPath("invalid" as any, 0);
  } catch (e) {
    threw = true;
    message = (e as Error).message;
  }
  assertEquals(threw, true);
  assertEquals(message.includes("invalid path"), true);
});
