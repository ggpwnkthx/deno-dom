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

let _uidCounter = 0;
function nextId(): string {
  return `job_${++_uidCounter}`;
}

function createSchedulerInstance(config?: SchedulerConfig): Scheduler {
  let queue: Queue;
  let loopGuard: LoopGuard;
  let flushScheduled = false;
  let flushCount = 0;
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
    flushCount = 0;
    generation++;
    internalDiagnostics = { flushCount: 0, nestedFlushCount: 0, loopGuardTriggers: 0 };
  }

  function scheduleMicrotask() {
    if (flushScheduled) return;
    flushScheduled = true;
    const currentGeneration = generation;
    queueMicrotask(() => doFlush(currentGeneration));
  }

  function doFlush(generationAtSchedule: number): boolean {
    if (generationAtSchedule !== generation) return false;
    flushScheduled = false;
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
    doFlush(currentGeneration);
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
    };
  }

  reset();

  return { queueUpdate, schedule, flushUpdates: flushSync, getDiagnostics, reset };
}

let _globalScheduler: Scheduler | null = null;

function getGlobalScheduler(): Scheduler {
  if (!_globalScheduler) {
    _globalScheduler = createSchedulerInstance();
  }
  return _globalScheduler;
}

export function queueUpdate(fn: () => void, dedupeKey?: DedupeKey): void {
  getGlobalScheduler().queueUpdate(fn, dedupeKey);
}

export function schedule(fn: () => void, dedupeKey?: DedupeKey): void {
  getGlobalScheduler().schedule(fn, dedupeKey);
}

export function flushUpdates(): void {
  getGlobalScheduler().flushUpdates();
}

export function getDiagnostics(): SchedulerDiagnostics {
  return getGlobalScheduler().getDiagnostics();
}

export function resetScheduler(): void {
  if (_globalScheduler) {
    _globalScheduler.reset();
  }
}

export function createScheduler(config?: SchedulerConfig): Scheduler {
  return createSchedulerInstance(config);
}
