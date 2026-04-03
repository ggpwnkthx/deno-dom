import { assertEquals } from "@std/assert";
import {
  createScheduler,
  flushUpdates,
  getDiagnostics,
  queueUpdate,
  resetScheduler,
  schedule,
} from "../src/mod.ts";

Deno.test("schedule is an alias for queueUpdate", () => {
  const scheduler = createScheduler();
  const order: number[] = [];

  scheduler.schedule(() => order.push(1));
  scheduler.queueUpdate(() => order.push(2));
  scheduler.schedule(() => order.push(3));

  scheduler.flushUpdates();

  assertEquals(order, [1, 2, 3]);
});

Deno.test("global queueUpdate schedules a job", () => {
  resetScheduler();
  let ran = false;

  queueUpdate(() => {
    ran = true;
  });

  assertEquals(ran, false);

  flushUpdates();

  assertEquals(ran, true);
});

Deno.test("global resetScheduler clears global state", () => {
  resetScheduler();

  queueUpdate(() => {});
  flushUpdates();

  resetScheduler();

  const diag = getDiagnostics();
  assertEquals(diag.enqueuedCount, 0);
  assertEquals(diag.flushCount, 0);
  assertEquals(diag.dequeuedCount, 0);
});

Deno.test("global getDiagnostics returns current scheduler state", () => {
  resetScheduler();

  queueUpdate(() => {});
  queueUpdate(() => {}, "dedupe");
  queueUpdate(() => {}, "dedupe");

  flushUpdates();

  const diag = getDiagnostics();
  assertEquals(diag.enqueuedCount, 3);
  assertEquals(diag.deduplicatedCount, 1);
  assertEquals(diag.flushCount, 1);
  assertEquals(diag.flushScheduled, false);
});

Deno.test("global schedule schedules a job", () => {
  resetScheduler();
  let ran = false;

  schedule(() => {
    ran = true;
  });

  assertEquals(ran, false);

  flushUpdates();

  assertEquals(ran, true);
});

Deno.test("global createScheduler returns independent scheduler instance", () => {
  resetScheduler();

  const scheduler = createScheduler();
  let ran = false;

  scheduler.queueUpdate(() => {
    ran = true;
  });
  scheduler.flushUpdates();

  assertEquals(ran, true);
  assertEquals(getDiagnostics().enqueuedCount, 0);
});
