import { assertEquals, assertThrows } from "@std/assert@1.0.19";
import { ValidationError } from "../src/errors.ts";
import {
  isBoolean,
  isFunction,
  isNonNull,
  isNumber,
  isPromiseLike,
  isString,
  requireFunction,
  requireNonNull,
  requireNumber,
  requireString,
} from "../src/validation.ts";

Deno.test("isString returns true for strings", () => {
  assertEquals(isString("hello"), true);
  assertEquals(isString(""), true);
});

Deno.test("isString returns false for non-strings", () => {
  assertEquals(isString(123), false);
  assertEquals(isString(null), false);
  assertEquals(isString(undefined), false);
  assertEquals(isString({}), false);
});

Deno.test("isNumber returns true for numbers", () => {
  assertEquals(isNumber(0), true);
  assertEquals(isNumber(42), true);
  assertEquals(isNumber(NaN), true);
  assertEquals(isNumber(-1.5), true);
});

Deno.test("isNumber returns false for non-numbers", () => {
  assertEquals(isNumber("42"), false);
  assertEquals(isNumber(null), false);
  assertEquals(isNumber(undefined), false);
});

Deno.test("isFunction returns true for functions", () => {
  assertEquals(isFunction(() => {}), true);
  assertEquals(isFunction(class {}), true);
  assertEquals(isFunction(Math.abs), true);
});

Deno.test("isFunction returns false for non-functions", () => {
  assertEquals(isFunction(42), false);
  assertEquals(isFunction({}), false);
  assertEquals(isFunction(""), false);
  assertEquals(isFunction(null), false);
});

Deno.test("isBoolean returns true for booleans", () => {
  assertEquals(isBoolean(true), true);
  assertEquals(isBoolean(false), true);
});

Deno.test("isBoolean returns false for non-booleans", () => {
  assertEquals(isBoolean(1), false);
  assertEquals(isBoolean("true"), false);
  assertEquals(isBoolean(null), false);
});

Deno.test("isNonNull returns true for non-nullish values", () => {
  assertEquals(isNonNull(0), true);
  assertEquals(isNonNull(""), true);
  assertEquals(isNonNull(false), true);
  assertEquals(isNonNull({}), true);
  assertEquals(isNonNull([]), true);
});

Deno.test("isNonNull returns false for null and undefined", () => {
  assertEquals(isNonNull(null), false);
  assertEquals(isNonNull(undefined), false);
});

Deno.test("isPromiseLike returns true for Promise-like objects", () => {
  assertEquals(isPromiseLike(Promise.resolve(1)), true);
  const thenable = { then: (resolve: (v: number) => number) => resolve(1) };
  assertEquals(isPromiseLike(thenable), true);
});

Deno.test("isPromiseLike returns false for non-Promise-like objects", () => {
  assertEquals(isPromiseLike(42), false);
  assertEquals(isPromiseLike({}), false);
  assertEquals(isPromiseLike(null), false);
  assertEquals(isPromiseLike(""), false);
});

Deno.test("requireString returns value if string", () => {
  assertEquals(requireString("hello", "name"), "hello");
  assertEquals(requireString("", "name"), "");
});

Deno.test("requireString throws ValidationError with context for non-string", () => {
  try {
    requireString(123, "name");
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof ValidationError, true);
    assertEquals((e as ValidationError).code, "VALIDATION_FAILED");
    assertEquals((e as ValidationError).context?.name, "name");
    assertEquals((e as ValidationError).context?.value, 123);
  }
  assertThrows(
    () => requireString(null, "name"),
    ValidationError,
    "name must be a string",
  );
  assertThrows(
    () => requireString(undefined, "name"),
    ValidationError,
    "name must be a string",
  );
});

Deno.test("requireNumber returns value if number", () => {
  assertEquals(requireNumber(0, "count"), 0);
  assertEquals(requireNumber(42, "count"), 42);
  assertEquals(requireNumber(NaN, "count"), NaN);
});

Deno.test("requireNumber throws ValidationError with context for non-number", () => {
  try {
    requireNumber("42", "count");
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof ValidationError, true);
    assertEquals((e as ValidationError).code, "VALIDATION_FAILED");
    assertEquals((e as ValidationError).context?.name, "count");
    assertEquals((e as ValidationError).context?.value, "42");
  }
  assertThrows(
    () => requireNumber(null, "count"),
    ValidationError,
    "count must be a number",
  );
});

Deno.test("requireFunction returns value if function", () => {
  const fn = () => {};
  assertEquals(requireFunction(fn, "callback"), fn);
});

Deno.test("requireFunction throws ValidationError with context for non-function", () => {
  try {
    requireFunction(42, "callback");
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof ValidationError, true);
    assertEquals((e as ValidationError).code, "VALIDATION_FAILED");
    assertEquals((e as ValidationError).context?.name, "callback");
    assertEquals((e as ValidationError).context?.value, 42);
  }
  assertThrows(
    () => requireFunction({}, "callback"),
    ValidationError,
    "callback must be a function",
  );
});

Deno.test("requireNonNull returns value if non-nullish", () => {
  assertEquals(requireNonNull(0, "value"), 0);
  assertEquals(requireNonNull("", "value"), "");
  assertEquals(requireNonNull(false, "value"), false);
  assertEquals(requireNonNull({}, "value"), {});
});

Deno.test("requireNonNull throws ValidationError with context for null or undefined", () => {
  try {
    requireNonNull(null, "value");
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof ValidationError, true);
    assertEquals((e as ValidationError).code, "VALIDATION_FAILED");
    assertEquals((e as ValidationError).context?.name, "value");
    assertEquals((e as ValidationError).context?.value, null);
  }
  assertThrows(
    () => requireNonNull(undefined, "value"),
    ValidationError,
    "value must not be null or undefined",
  );
});
