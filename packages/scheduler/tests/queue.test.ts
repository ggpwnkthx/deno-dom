import { assertEquals } from "@std/assert";
import { createQueue, nextId, type UpdateJob } from "@ggpwnkthx/dom-scheduler";

function makeJob(id?: string, dedupeKey?: string | number): UpdateJob {
  return { id: id ?? nextId(), dedupeKey, fn: () => {} };
}

Deno.test("dequeueAll returns all jobs in FIFO order", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a"));
  queue.enqueue(makeJob("b"));
  queue.enqueue(makeJob("c"));

  const jobs = queue.dequeueAll();

  assertEquals(jobs.length, 3);
  assertEquals(jobs[0].id, "a");
  assertEquals(jobs[1].id, "b");
  assertEquals(jobs[2].id, "c");
});

Deno.test("dequeueAll clears the queue and dedupe set", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a", "key1"));
  queue.enqueue(makeJob("b", "key2"));
  queue.dequeueAll();

  const second = queue.dequeueAll();
  assertEquals(second.length, 0);
});

Deno.test("enqueue returns true when job is added", () => {
  const queue = createQueue();

  const result = queue.enqueue(makeJob("a"));
  assertEquals(result, true);
});

Deno.test("same dedupe key collapses within one flush", () => {
  const queue = createQueue();

  const first = queue.enqueue(makeJob("a", "dedupe"));
  const second = queue.enqueue(makeJob("b", "dedupe"));
  const third = queue.enqueue(makeJob("c", "dedupe"));

  assertEquals(first, true);
  assertEquals(second, false);
  assertEquals(third, false);

  const jobs = queue.dequeueAll();
  assertEquals(jobs.length, 1);
  assertEquals(jobs[0].id, "a");
});

Deno.test("different dedupe keys coexist", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a", "key1"));
  queue.enqueue(makeJob("b", "key2"));
  queue.enqueue(makeJob("c", "key3"));

  const jobs = queue.dequeueAll();
  assertEquals(jobs.length, 3);
});

Deno.test("same key can run again after dequeueAll", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a", "dedupe"));
  queue.dequeueAll();

  const result = queue.enqueue(makeJob("b", "dedupe"));
  assertEquals(result, true);

  const jobs = queue.dequeueAll();
  assertEquals(jobs.length, 1);
  assertEquals(jobs[0].id, "b");
});

Deno.test("jobs without dedupe key are never deduplicated", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a"));
  queue.enqueue(makeJob("b"));
  queue.enqueue(makeJob("c"));

  const jobs = queue.dequeueAll();
  assertEquals(jobs.length, 3);
});

Deno.test("string and number dedupe keys are distinct", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a", "1"));
  queue.enqueue(makeJob("b", 1));

  const jobs = queue.dequeueAll();
  assertEquals(jobs.length, 2);
});

Deno.test("enqueuedCount increments on every enqueue", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a"));
  queue.enqueue(makeJob("b"));
  queue.enqueue(makeJob("c", "dedupe"));

  assertEquals(queue.getDiagnostics().enqueuedCount, 3);
});

Deno.test("deduplicatedCount increments only on actual deduplication", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a", "key"));
  const second = queue.enqueue(makeJob("b", "key"));
  const third = queue.enqueue(makeJob("c", "key"));

  assertEquals(second, false);
  assertEquals(third, false);
  assertEquals(queue.getDiagnostics().deduplicatedCount, 2);
});

Deno.test("dequeuedCount reflects total jobs removed", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a"));
  queue.enqueue(makeJob("b", "key"));
  queue.enqueue(makeJob("c", "key"));

  queue.dequeueAll();
  assertEquals(queue.getDiagnostics().dequeuedCount, 2);

  queue.dequeueAll();
  assertEquals(queue.getDiagnostics().dequeuedCount, 2);
});

Deno.test("reset clears all state and diagnostics", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a"));
  queue.enqueue(makeJob("b", "key"));
  queue.dequeueAll();

  queue.reset();

  const diag = queue.getDiagnostics();
  assertEquals(diag.enqueuedCount, 0);
  assertEquals(diag.dequeuedCount, 0);
  assertEquals(diag.deduplicatedCount, 0);
});

Deno.test("reset allows same dedupe key to be re-enqueued", () => {
  const queue = createQueue();

  queue.enqueue(makeJob("a", "key"));
  queue.dequeueAll();

  queue.reset();

  const result = queue.enqueue(makeJob("b", "key"));
  assertEquals(result, true);
});
