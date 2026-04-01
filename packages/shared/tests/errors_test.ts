import { assertEquals, assertThrows } from "@std/assert@1.0.19";
import {
  DOMSharedError,
  err,
  InvariantError,
  NotImplementedError,
  ok,
  ValidationError,
} from "../src/errors.ts";

Deno.test("DOMSharedError creates error with correct name, code, and context", () => {
  const error = new DOMSharedError("test", "TEST_CODE", { name: "foo", value: 1 });
  assertEquals(error.name, "DOMSharedError");
  assertEquals(error.message, "test");
  assertEquals(error.code, "TEST_CODE");
  assertEquals(error.context, { name: "foo", value: 1 });
  assertEquals(error instanceof Error, true);
});

Deno.test("DOMSharedError uses defaults when code and context not provided", () => {
  const error = new DOMSharedError("test");
  assertEquals(error.code, "DOM_SHARED_ERROR");
  assertEquals(error.context, undefined);
});

Deno.test("NotImplementedError creates correct error with code and context", () => {
  const error = new NotImplementedError("foo");
  assertEquals(error.name, "NotImplementedError");
  assertEquals(error.message, "foo is not implemented yet");
  assertEquals(error.code, "NOT_IMPLEMENTED");
  assertEquals(error.context, { name: "api", value: "foo" });
  assertEquals(error instanceof DOMSharedError, true);
});

Deno.test("NotImplementedError can be thrown and caught", () => {
  assertThrows(
    () => {
      throw new NotImplementedError("bar");
    },
    NotImplementedError,
    "bar is not implemented yet",
  );
});

Deno.test("ValidationError creates error with correct name, code, and context", () => {
  const error = new ValidationError("invalid input", { name: "count", value: "abc" });
  assertEquals(error.name, "ValidationError");
  assertEquals(error.message, "invalid input");
  assertEquals(error.code, "VALIDATION_FAILED");
  assertEquals(error.context, { name: "count", value: "abc" });
  assertEquals(error instanceof DOMSharedError, true);
});

Deno.test("InvariantError creates error with correct name, code, and context", () => {
  const error = new InvariantError("invariant violated", {
    name: "counter",
    value: -1,
  });
  assertEquals(error.name, "InvariantError");
  assertEquals(error.message, "invariant violated");
  assertEquals(error.code, "INVARIANT_VIOLATED");
  assertEquals(error.context, { name: "counter", value: -1 });
  assertEquals(error instanceof DOMSharedError, true);
});

Deno.test("ok creates correct result shape", () => {
  const result = ok(42);
  assertEquals(result.ok, true);
  assertEquals((result as { ok: true; value: number }).value, 42);
});

Deno.test("err creates correct result shape", () => {
  const error = new ValidationError("fail");
  const result = err(error);
  assertEquals(result.ok, false);
  assertEquals((result as { ok: false; error: ValidationError }).error, error);
});

Deno.test("Result discriminated union narrows correctly", () => {
  const success = ok(1);
  const fail = err(new ValidationError("e"));
  assertEquals(success.ok, true);
  assertEquals(fail.ok, false);
  if (success.ok) {
    assertEquals(success.value, 1);
  }
  if (!fail.ok) {
    assertEquals(fail.error instanceof ValidationError, true);
  }
});
