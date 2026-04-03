import { assertEquals, assertThrows } from "@std/assert";
import { InvariantError, ValidationError } from "@ggpwnkthx/dom-shared";
import { createScheduler } from "@ggpwnkthx/dom-scheduler";

async function drainMicrotasks(times = 1): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise<void>((resolve) => queueMicrotask(resolve));
  }
}

Deno.test("queued job does not run inline", () => {
  const scheduler = createScheduler();
  let ran = false;

  scheduler.queueUpdate(() => {
    ran = true;
  });

  assertEquals(ran, false);
});

Deno.test("queued job runs after microtask drain", async () => {
  const scheduler = createScheduler();
  let ran = false;

  scheduler.queueUpdate(() => {
    ran = true;
  });

  await drainMicrotasks();

  assertEquals(ran, true);
});

Deno.test("multiple sync enqueues batch into one scheduled flush", async () => {
  const scheduler = createScheduler();
  let count = 0;

  scheduler.queueUpdate(() => count++);
  scheduler.queueUpdate(() => count++);
  scheduler.queueUpdate(() => count++);

  assertEquals(count, 0);

  await drainMicrotasks();

  assertEquals(count, 3);

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.flushCount, 1);
});

Deno.test("deduplication collapses same key within one flush", async () => {
  const scheduler = createScheduler();
  let runCount = 0;

  scheduler.queueUpdate(() => runCount++, "dedupe");
  scheduler.queueUpdate(() => runCount++, "dedupe");
  scheduler.queueUpdate(() => runCount++, "dedupe");

  await drainMicrotasks();

  assertEquals(runCount, 1);

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.deduplicatedCount, 2);
});

Deno.test("same dedupe key can run again in a later flush", async () => {
  const scheduler = createScheduler();
  let runCount = 0;

  scheduler.queueUpdate(() => runCount++, "key");
  await drainMicrotasks();
  assertEquals(runCount, 1);

  scheduler.queueUpdate(() => runCount++, "key");
  await drainMicrotasks();
  assertEquals(runCount, 2);

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.deduplicatedCount, 0);
});

Deno.test("flushUpdates drains immediately", () => {
  const scheduler = createScheduler();
  let ran = false;

  scheduler.queueUpdate(() => {
    ran = true;
  });

  scheduler.flushUpdates();

  assertEquals(ran, true);
});

Deno.test("flushUpdates leaves no scheduled flush for later", async () => {
  const scheduler = createScheduler();
  let count = 0;

  scheduler.queueUpdate(() => count++);
  scheduler.flushUpdates();

  await drainMicrotasks();

  assertEquals(count, 1);
  assertEquals(scheduler.getDiagnostics().flushScheduled, false);
});

Deno.test("flushUpdates on empty queue does not increment flushCount", () => {
  const scheduler = createScheduler();

  scheduler.flushUpdates();

  assertEquals(scheduler.getDiagnostics().flushCount, 0);
});

Deno.test("reset invalidates already-scheduled microtasks", async () => {
  const scheduler = createScheduler();
  let ran = false;

  scheduler.queueUpdate(() => {
    ran = true;
  });

  scheduler.reset();

  await drainMicrotasks();

  assertEquals(ran, false);
});

Deno.test("reset increments generation and fresh jobs work", () => {
  const scheduler = createScheduler();
  let ran = false;

  scheduler.queueUpdate(() => {
    ran = true;
  });

  scheduler.reset();
  scheduler.flushUpdates();

  assertEquals(ran, false);

  scheduler.queueUpdate(() => {
    ran = true;
  });
  scheduler.flushUpdates();

  assertEquals(ran, true);
});

Deno.test("nested flushUpdates counts nested flushes", () => {
  const scheduler = createScheduler({ maxLoopDepth: 10 });
  let outerRan = false;
  let innerRan = false;

  scheduler.queueUpdate(() => {
    outerRan = true;
    scheduler.queueUpdate(() => {
      innerRan = true;
    });
    scheduler.flushUpdates();
  });

  scheduler.flushUpdates();

  assertEquals(outerRan, true);
  assertEquals(innerRan, true);

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.nestedFlushCount, 1);
});

Deno.test("thrown job restores depth so next top-level flush is still allowed", () => {
  const scheduler = createScheduler({ maxLoopDepth: 1 });
  let ran = false;

  scheduler.queueUpdate(() => {
    throw new Error("boom");
  });
  assertThrows(() => scheduler.flushUpdates(), Error, "boom");

  scheduler.queueUpdate(() => {
    ran = true;
  });
  scheduler.flushUpdates();

  assertEquals(ran, true);

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.nestedFlushCount, 0);
  assertEquals(diag.loopGuardTriggers, 0);
});

Deno.test("loop guard throws InvariantError when depth limit is exceeded", () => {
  const scheduler = createScheduler({ maxLoopDepth: 1 });

  scheduler.queueUpdate(() => {
    scheduler.queueUpdate(() => {});
    scheduler.flushUpdates();
  });

  assertThrows(() => scheduler.flushUpdates(), InvariantError);

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.loopGuardTriggers, 1);
});

Deno.test("queueUpdate throws TypeError when fn is not a function", () => {
  const scheduler = createScheduler();

  assertThrows(
    () => scheduler.queueUpdate(null as unknown as () => void),
    TypeError,
    "fn must be a function",
  );
  assertThrows(
    () => scheduler.queueUpdate(undefined as unknown as () => void),
    TypeError,
    "fn must be a function",
  );
  assertThrows(
    () => scheduler.queueUpdate(Symbol("x") as unknown as () => void),
    TypeError,
    "fn must be a function",
  );
  assertThrows(
    () => scheduler.queueUpdate({} as unknown as () => void),
    TypeError,
    "fn must be a function",
  );
  assertThrows(
    () => scheduler.queueUpdate(1 as unknown as () => void),
    TypeError,
    "fn must be a function",
  );
});

Deno.test("queueUpdate throws TypeError when dedupeKey is invalid", () => {
  const scheduler = createScheduler();

  assertThrows(
    () => scheduler.queueUpdate(() => {}, Symbol("x") as unknown as string | number),
    TypeError,
    "dedupeKey must be a string or number",
  );
  assertThrows(
    () =>
      scheduler.queueUpdate(() => {}, { key: "value" } as unknown as string | number),
    TypeError,
    "dedupeKey must be a string or number",
  );
  assertThrows(
    () => scheduler.queueUpdate(() => {}, true as unknown as string | number),
    TypeError,
    "dedupeKey must be a string or number",
  );
});

Deno.test("createScheduler throws ValidationError for invalid maxLoopDepth", () => {
  assertThrows(
    () => createScheduler({ maxLoopDepth: -1 }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createScheduler({ maxLoopDepth: 0 }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createScheduler({ maxLoopDepth: 1.5 }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createScheduler({ maxLoopDepth: NaN }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
  assertThrows(
    () => createScheduler({ maxLoopDepth: Infinity }),
    ValidationError,
    "maxLoopDepth must be a positive integer",
  );
});

Deno.test("after thrown job, diagnostics reflect the failed batch", () => {
  const scheduler = createScheduler();

  scheduler.queueUpdate(() => {
    throw new Error("boom");
  });

  assertThrows(() => scheduler.flushUpdates(), Error, "boom");

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.flushCount, 1);
  assertEquals(diag.dequeuedCount, 1);
  assertEquals(diag.flushScheduled, false);
});

Deno.test("self-scheduling job chains microtasks correctly", async () => {
  const scheduler = createScheduler();
  let count = 0;

  scheduler.queueUpdate(function recurse() {
    count++;
    if (count < 5) {
      scheduler.queueUpdate(recurse);
    }
  });

  // 5 jobs each scheduling the next via microtask: 5 drains is sufficient.
  // Use 10 to provide safety margin without being wasteful.
  await drainMicrotasks(10);

  assertEquals(count, 5);
});

Deno.test("flushUpdates can be called from within a job", () => {
  const scheduler = createScheduler({ maxLoopDepth: 10 });
  let count = 0;

  scheduler.queueUpdate(() => {
    count++;
  });
  scheduler.queueUpdate(() => {
    count++;
    scheduler.flushUpdates();
  });
  scheduler.queueUpdate(() => {
    count++;
  });

  scheduler.flushUpdates();

  assertEquals(count, 3);
});

Deno.test("jobs execute in deterministic FIFO order", () => {
  const scheduler = createScheduler();
  const order: number[] = [];

  scheduler.queueUpdate(() => order.push(1));
  scheduler.queueUpdate(() => order.push(2));
  scheduler.queueUpdate(() => order.push(3));

  scheduler.flushUpdates();

  assertEquals(order, [1, 2, 3]);
});

Deno.test("getDiagnostics returns accurate counts after batching", () => {
  const scheduler = createScheduler();

  scheduler.queueUpdate(() => {});
  scheduler.queueUpdate(() => {});
  scheduler.queueUpdate(() => {}, "dedupe");
  scheduler.queueUpdate(() => {}, "dedupe");

  scheduler.flushUpdates();

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.enqueuedCount, 4);
  assertEquals(diag.dequeuedCount, 3);
  assertEquals(diag.deduplicatedCount, 1);
  assertEquals(diag.flushCount, 1);
  assertEquals(diag.nestedFlushCount, 0);
  assertEquals(diag.loopGuardTriggers, 0);
  assertEquals(diag.flushScheduled, false);
});

Deno.test("reset clears all diagnostics and state", () => {
  const scheduler = createScheduler();

  scheduler.queueUpdate(() => {});
  scheduler.queueUpdate(() => {});
  scheduler.flushUpdates();

  scheduler.reset();

  const diag = scheduler.getDiagnostics();
  assertEquals(diag.enqueuedCount, 0);
  assertEquals(diag.dequeuedCount, 0);
  assertEquals(diag.deduplicatedCount, 0);
  assertEquals(diag.flushCount, 0);
  assertEquals(diag.nestedFlushCount, 0);
  assertEquals(diag.loopGuardTriggers, 0);
  assertEquals(diag.flushScheduled, false);
});
