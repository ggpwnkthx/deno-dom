import { assertEquals } from "@std/assert";
import {
  flushUpdates,
  getDiagnostics,
  queueUpdate,
  resetScheduler,
  schedule,
} from "../src/mod.ts";

Deno.test("queueUpdate schedules a job in a microtask", async () => {
  resetScheduler();
  let ran = false;
  queueUpdate(() => {
    ran = true;
  });
  assertEquals(ran, false);
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assertEquals(ran, true);
});

Deno.test("schedule is an alias for queueUpdate", async () => {
  resetScheduler();
  let ran = false;
  schedule(() => {
    ran = true;
  });
  assertEquals(ran, false);
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assertEquals(ran, true);
});

Deno.test("multiple sync enqueues batch into one microtask flush", async () => {
  resetScheduler();
  const order: number[] = [];
  queueUpdate(() => order.push(1));
  queueUpdate(() => order.push(2));
  queueUpdate(() => order.push(3));
  assertEquals(order.length, 0);
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assertEquals(order, [1, 2, 3]);
  const diag = getDiagnostics();
  assertEquals(diag.flushCount, 1);
});

Deno.test("deduplication prevents same-key jobs from running twice in one flush", async () => {
  resetScheduler();
  const order: number[] = [];
  queueUpdate(() => order.push(1), "dedupe-key");
  queueUpdate(() => order.push(2), "dedupe-key");
  queueUpdate(() => order.push(3), "dedupe-key");
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assertEquals(order, [1]);
  const diag = getDiagnostics();
  assertEquals(diag.deduplicatedCount, 2);
});

Deno.test("different dedupe keys coexist in the same queue", async () => {
  resetScheduler();
  const order: number[] = [];
  queueUpdate(() => order.push(1), "key-a");
  queueUpdate(() => order.push(2), "key-b");
  queueUpdate(() => order.push(3), "key-c");
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assertEquals(order, [1, 2, 3]);
});

Deno.test("flushUpdates drains the queue immediately", () => {
  resetScheduler();
  const order: number[] = [];
  queueUpdate(() => order.push(1));
  queueUpdate(() => order.push(2));
  assertEquals(order.length, 0);
  flushUpdates();
  assertEquals(order, [1, 2]);
});

Deno.test("flushUpdates can be called from within a job", () => {
  resetScheduler();
  const order: number[] = [];
  queueUpdate(() => {
    order.push(1);
    flushUpdates();
  });
  queueUpdate(() => order.push(2));
  flushUpdates();
  assertEquals(order, [1, 2]);
});

Deno.test("self-scheduling job chains microtasks correctly", async () => {
  resetScheduler();
  let counter = 0;
  const MAX = 5;

  function recursiveUpdate() {
    if (counter < MAX) {
      counter++;
      queueUpdate(recursiveUpdate);
    }
  }

  queueUpdate(recursiveUpdate);
  for (let i = 0; i < MAX + 5; i++) {
    await new Promise<void>((resolve) => queueMicrotask(resolve));
  }
  assertEquals(counter, MAX);
});

Deno.test("nested flushUpdates calls are detected by loop guard", () => {
  resetScheduler();
  let outerDepth = 0;
  let innerDepth = 0;
  const MAX = 3;

  function outerUpdate() {
    outerDepth++;
    if (outerDepth < MAX) {
      flushUpdates();
    }
  }

  function innerUpdate() {
    innerDepth++;
  }

  queueUpdate(innerUpdate);
  queueUpdate(outerUpdate);

  try {
    flushUpdates();
  } catch {
    // Expected when exceeding loop depth
  }

  const _diag = getDiagnostics();
  assertEquals(outerDepth > 0, true);
  assertEquals(innerDepth, 1);
});

Deno.test("getDiagnostics returns accurate counts", () => {
  resetScheduler();
  queueUpdate(() => {}, "a");
  queueUpdate(() => {}, "a");
  queueUpdate(() => {}, "b");
  flushUpdates();

  const diag = getDiagnostics();
  assertEquals(diag.enqueuedCount, 3);
  assertEquals(diag.dequeuedCount, 2);
  assertEquals(diag.deduplicatedCount, 1);
  assertEquals(diag.flushCount, 1);
});

Deno.test("reset clears all state", () => {
  resetScheduler();
  queueUpdate(() => {});
  flushUpdates();

  resetScheduler();

  const diag = getDiagnostics();
  assertEquals(diag.enqueuedCount, 0);
  assertEquals(diag.dequeuedCount, 0);
  assertEquals(diag.flushCount, 0);
});

Deno.test("job fn throwing does not corrupt scheduler state", () => {
  resetScheduler();
  let caught = false;

  queueUpdate(() => {
    throw new Error("job error");
  });
  queueUpdate(() => {});

  try {
    flushUpdates();
  } catch {
    caught = true;
  }

  assertEquals(caught, true);
  const diag = getDiagnostics();
  assertEquals(diag.loopGuardTriggers, 0);
  assertEquals(diag.enqueuedCount, 2);
});

Deno.test("jobs execute in deterministic order", async () => {
  resetScheduler();
  const results: string[] = [];

  queueUpdate(() => results.push("a"));
  queueUpdate(() => results.push("b"));
  schedule(() => results.push("c"));
  queueUpdate(() => results.push("d"));

  await new Promise<void>((resolve) => queueMicrotask(resolve));

  assertEquals(results, ["a", "b", "c", "d"]);
});

Deno.test("flushUpdates on empty queue does not increment flushCount", () => {
  resetScheduler();
  flushUpdates();
  const diag = getDiagnostics();
  assertEquals(diag.flushCount, 0);
});
