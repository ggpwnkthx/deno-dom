/**
 * @ggpwnkthx/dom-scheduler - Scheduler instance creation.
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

export function createSchedulerInstance(config?: SchedulerConfig): Scheduler {
  let queue: Queue;
  let loopGuard: LoopGuard;
  let flushScheduled = false;
  let generation = 0;
  let internalDiagnostics = {
    flushCount: 0,
    nestedFlushCount: 0,
    loopGuardTriggers: 0,
  };

  function reset() {
    queue = createQueue();
    loopGuard = createLoopGuard(config);
    flushScheduled = false;
    generation++;
    internalDiagnostics = { flushCount: 0, nestedFlushCount: 0, loopGuardTriggers: 0 };
  }

  function scheduleMicrotask() {
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
      internalDiagnostics.loopGuardTriggers++;
      throw new InvariantError(guardResult.reason);
    }
    const previousDepth = currentDepth;
    currentDepth++;
    loopGuard.recordDepth();

    const jobs = queue.dequeueAll();
    if (jobs.length > 0) {
      internalDiagnostics.flushCount++;
      for (const job of jobs) {
        job.fn();
      }
    }

    currentDepth = previousDepth;
    loopGuard.restoreDepth(previousDepth);
    return true;
  }

  function flushSync() {
    flushScheduled = false;
    const currentGeneration = generation;
    doFlush(currentGeneration, false);
  }

  let currentDepth = 0;

  function queueUpdate(fn: () => void, dedupeKey?: DedupeKey): void {
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
