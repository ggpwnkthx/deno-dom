import { assertEquals, assertThrows } from "@std/assert";
import {
  DOMSharedError,
  InvariantError,
  NotImplementedError,
  ValidationError,
} from "../src/errors.ts";
import {
  assertBoolean,
  assertExists,
  assertFunction,
  assertNever,
  assertNotImplemented,
  assertNumber,
  assertString,
} from "../src/assert.ts";

Deno.test("assertExists throws InvariantError for null", () => {
  assertThrows(
    () => assertExists(null),
    InvariantError,
    "value must not be null or undefined",
  );
});

Deno.test("assertExists throws InvariantError for undefined", () => {
  assertThrows(
    () => assertExists(undefined),
    InvariantError,
    "value must not be null or undefined",
  );
});

Deno.test("assertExists passes for non-nullish values", () => {
  assertExists(0);
  assertExists("");
  assertExists(false);
  assertExists({});
});

Deno.test("assertExists throws InvariantError with custom message", () => {
  assertThrows(() => assertExists(null, "custom"), InvariantError, "custom");
});

Deno.test("assertExists includes value in error context", () => {
  try {
    assertExists(null);
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof InvariantError, true);
    assertEquals((e as InvariantError).context?.value, null);
  }
});

Deno.test("assertString passes for string", () => {
  assertString("hello");
  assertString("");
});

Deno.test("assertString throws ValidationError for non-string", () => {
  assertThrows(() => assertString(123), ValidationError, "value must be a string");
  assertThrows(() => assertString(null), ValidationError, "value must be a string");
  assertThrows(
    () => assertString(undefined),
    ValidationError,
    "value must be a string",
  );
});

Deno.test("assertNumber passes for number", () => {
  assertNumber(0);
  assertNumber(42);
  assertNumber(NaN);
});

Deno.test("assertNumber throws ValidationError for non-number", () => {
  assertThrows(() => assertNumber("42"), ValidationError, "value must be a number");
  assertThrows(() => assertNumber(null), ValidationError, "value must be a number");
});

Deno.test("assertFunction passes for function", () => {
  assertFunction(() => {});
  assertFunction(class {});
});

Deno.test("assertFunction throws ValidationError for non-function", () => {
  assertThrows(() => assertFunction(42), ValidationError, "value must be a function");
  assertThrows(() => assertFunction({}), ValidationError, "value must be a function");
});

Deno.test("assertBoolean passes for boolean", () => {
  assertBoolean(true);
  assertBoolean(false);
});

Deno.test("assertBoolean throws ValidationError for non-boolean", () => {
  assertThrows(() => assertBoolean(1), ValidationError, "value must be a boolean");
  assertThrows(() => assertBoolean("true"), ValidationError, "value must be a boolean");
});

Deno.test("assertNever throws InvariantError for any value", () => {
  try {
    assertNever("anything" as never);
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof InvariantError, true);
    assertEquals(e instanceof DOMSharedError, true);
    assertEquals((e as InvariantError).code, "INVARIANT_VIOLATED");
  }
  assertThrows(() => assertNever(123 as never), InvariantError, "unexpected value");
});

Deno.test("assertNotImplemented throws NotImplementedError with code and context", () => {
  try {
    assertNotImplemented("foo");
    throw new Error("should have thrown");
  } catch (e) {
    assertEquals(e instanceof NotImplementedError, true);
    assertEquals((e as NotImplementedError).code, "NOT_IMPLEMENTED");
    assertEquals((e as NotImplementedError).context?.name, "api");
    assertEquals((e as NotImplementedError).context?.value, "foo");
  }
});
