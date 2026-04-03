import { assertEquals, assertThrows } from "@std/assert";
import { ValidationError } from "@ggpwnkthx/dom-shared";
import { createLoopGuard } from "@ggpwnkthx/dom-scheduler";

Deno.test("recordDepth increments depth and counts nested flushes", () => {
  const guard = createLoopGuard({ maxLoopDepth: 10 });

  assertEquals(guard.checkReentrancy().allowed, true);

  guard.recordDepth();
  assertEquals(guard.getDiagnostics().nestedFlushCount, 0);

  guard.recordDepth();
  assertEquals(guard.getDiagnostics().nestedFlushCount, 1);

  guard.recordDepth();
  assertEquals(guard.getDiagnostics().nestedFlushCount, 2);

  guard.restoreDepth(0);
});

Deno.test("restoreDepth sets depth to the previous value", () => {
  const guard = createLoopGuard({ maxLoopDepth: 10 });

  guard.recordDepth();
  guard.recordDepth();
  guard.recordDepth();

  guard.restoreDepth(0);

  const result = guard.checkReentrancy();
  assertEquals(result.allowed, true);
});

Deno.test("checkReentrancy allows below max depth and rejects when next flush would exceed the limit", () => {
  const guard = createLoopGuard({ maxLoopDepth: 3 });

  guard.recordDepth();
  assertEquals(guard.checkReentrancy().allowed, true);

  guard.recordDepth();
  assertEquals(guard.checkReentrancy().allowed, true);

  guard.recordDepth();
  const rejected = guard.checkReentrancy();
  assertEquals(rejected.allowed, false);
  if (!rejected.allowed) {
    assertEquals(
      rejected.reason,
      "Loop guard triggered: max depth 3 exceeded",
    );
  }

  guard.restoreDepth(0);
});

Deno.test("loop guard rejects and increments counter when depth >= maxDepth", () => {
  const guard = createLoopGuard({ maxLoopDepth: 2 });

  guard.recordDepth();
  guard.recordDepth();

  const result = guard.checkReentrancy();
  assertEquals(result.allowed, false);
  assertEquals(guard.getDiagnostics().loopGuardTriggers, 1);

  guard.restoreDepth(0);
});

Deno.test("loop guard increments loopGuardTriggers on each checkReentrancy at >= maxDepth", () => {
  const guard = createLoopGuard({ maxLoopDepth: 2 });

  guard.recordDepth();
  guard.recordDepth();
  guard.recordDepth();

  assertEquals(guard.getDiagnostics().loopGuardTriggers, 0);

  guard.checkReentrancy();
  assertEquals(guard.getDiagnostics().loopGuardTriggers, 1);

  guard.checkReentrancy();
  assertEquals(guard.getDiagnostics().loopGuardTriggers, 2);

  guard.restoreDepth(0);
});

Deno.test("default maxLoopDepth is 100", () => {
  const guard = createLoopGuard();

  for (let i = 0; i < 100; i++) {
    guard.recordDepth();
  }

  const result = guard.checkReentrancy();
  assertEquals(result.allowed, false);
  if (!result.allowed) {
    assertEquals(
      result.reason,
      "Loop guard triggered: max depth 100 exceeded",
    );
  }

  guard.restoreDepth(0);
});

Deno.test("createLoopGuard throws ValidationError for invalid maxLoopDepth", () => {
  assertThrows(
    () => createLoopGuard({ maxLoopDepth: -1 }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createLoopGuard({ maxLoopDepth: 0 }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createLoopGuard({ maxLoopDepth: 1.5 }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createLoopGuard({ maxLoopDepth: NaN }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createLoopGuard({ maxLoopDepth: null as unknown as number }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createLoopGuard({ maxLoopDepth: Infinity }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
});

Deno.test("reset clears all state", () => {
  const guard = createLoopGuard({ maxLoopDepth: 5 });

  guard.recordDepth();
  guard.recordDepth();
  guard.recordDepth();

  guard.reset();

  assertEquals(guard.getDiagnostics().nestedFlushCount, 0);
  assertEquals(guard.getDiagnostics().loopGuardTriggers, 0);
  assertEquals(guard.checkReentrancy().allowed, true);
});

Deno.test("nested flushes below limit leave diagnostics coherent", () => {
  const guard = createLoopGuard({ maxLoopDepth: 5 });

  guard.recordDepth();
  guard.recordDepth();

  const diag = guard.getDiagnostics();
  assertEquals(diag.nestedFlushCount, 1);
  assertEquals(diag.loopGuardTriggers, 0);

  guard.restoreDepth(0);
  guard.recordDepth();

  const diag2 = guard.getDiagnostics();
  assertEquals(diag2.nestedFlushCount, 1);
  assertEquals(diag2.loopGuardTriggers, 0);

  guard.restoreDepth(0);
});
