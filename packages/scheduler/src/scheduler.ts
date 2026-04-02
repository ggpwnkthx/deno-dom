import type {
  DedupeKey,
  Scheduler,
  SchedulerConfig,
  SchedulerDiagnostics,
} from "./types.ts";
import { createSchedulerInstance } from "./instance.ts";

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
