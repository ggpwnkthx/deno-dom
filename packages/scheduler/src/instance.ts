/**
 * Scheduler instance creation combining queue, loop guard, and microtask scheduling.
 * @module
 */

import { InvariantError } from "@ggpwnkthx/dom-shared";
import type {
  DedupeKey,
  Scheduler,
  SchedulerConfig,
  SchedulerDiagnostics,
  UpdateJob,
} from "./types.ts";
import { createQueue, type Queue } from "./queue.ts";
import { createLoopGuard, type LoopGuard } from "./guards.ts";
import { nextId } from "./id.ts";

/**
 * Creates a scheduler instance with queue, loop guard, and microtask scheduling.
 * @param config - Optional scheduler configuration
 * @returns A Scheduler instance
 */
export function createSchedulerInstance(config?: SchedulerConfig): Scheduler {
  let queue: Queue;
  let loopGuard: LoopGuard;
  let flushScheduled = false;
  let generation = 0;
  let internalDiagnostics = {
    flushCount: 0,
  };

  function reset() {
    queue = createQueue();
    loopGuard = createLoopGuard(config);
    flushScheduled = false;
    generation++;
    internalDiagnostics = { flushCount: 0 };
  }

  function scheduleMicrotask() {
    // flushScheduled prevents redundant work by ensuring the scheduled callback
    // clears it before any new work is queued. If a scheduled callback is already
    // in-flight, subsequent queueUpdate calls bail out early.
    if (flushScheduled) return;
    flushScheduled = true;
    const currentGeneration = generation;
    queueMicrotask(() => doFlush(currentGeneration, true));
  }

  function doFlush(generationAtSchedule: number, scheduled = false): boolean {
    if (generationAtSchedule !== generation) return false;
    if (scheduled) {
      flushScheduled = false;
    }
    const guardResult = loopGuard.checkReentrancy();
    if (!guardResult.allowed) {
      throw new InvariantError(guardResult.reason);
    }
    const previousDepth = currentDepth;
    currentDepth++;
    loopGuard.recordDepth();

    try {
      const jobs = queue.dequeueAll();
      if (jobs.length > 0) {
        internalDiagnostics.flushCount++;
        for (const job of jobs) {
          job.fn();
        }
      }
    } finally {
      currentDepth = previousDepth;
      loopGuard.restoreDepth(previousDepth);
    }
    return true;
  }

  // flushUpdates wrapper: job exceptions propagate out intentionally — callers
  // must handle or let them bubble. The try/finally in doFlush guarantees depth
  // is restored regardless of whether a job throws.
  function flushSync() {
    flushScheduled = false;
    const currentGeneration = generation;
    doFlush(currentGeneration, false);
  }

  // Tracks flush nesting depth locally. This mirrors loopGuard's internal depth counter
  // (via recordDepth/restoreDepth) but stays in sync with it for the duration of a
  // flush. The guard enforces the maxLoopDepth limit; currentDepth is a companion
  // tracker that must not exceed the guard's depth or the guard's protection is undermined.
  let currentDepth = 0;

  function queueUpdate(fn: () => void, dedupeKey?: DedupeKey): void {
    if (typeof fn !== "function") {
      throw new TypeError(`queueUpdate: fn must be a function, got ${typeof fn}`);
    }
    if (
      dedupeKey !== undefined && typeof dedupeKey !== "string"
      && typeof dedupeKey !== "number"
    ) {
      throw new TypeError(
        `queueUpdate: dedupeKey must be a string or number, got ${typeof dedupeKey}`,
      );
    }
    const job: UpdateJob = { id: nextId(), dedupeKey, fn };
    queue.enqueue(job);
    scheduleMicrotask();
  }

  function schedule(fn: () => void, dedupeKey?: DedupeKey): void {
    queueUpdate(fn, dedupeKey);
  }

  function getDiagnostics(): SchedulerDiagnostics {
    const q = queue.getDiagnostics();
    const g = loopGuard.getDiagnostics();
    return {
      ...q,
      flushCount: internalDiagnostics.flushCount,
      nestedFlushCount: g.nestedFlushCount,
      loopGuardTriggers: g.loopGuardTriggers,
      flushScheduled,
    };
  }

  reset();

  return { queueUpdate, schedule, flushUpdates: flushSync, getDiagnostics, reset };
}
