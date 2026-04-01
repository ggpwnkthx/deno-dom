/**
 * @ggpwnkthx/dom-scheduler - Microtask batching and rerender scheduling.
 * @module
 */

export {
  createScheduler,
  flushUpdates,
  getDiagnostics,
  queueUpdate,
  resetScheduler,
  schedule,
} from "./scheduler.ts";

export type { Scheduler, SchedulerConfig, SchedulerDiagnostics } from "./types.ts";
export type { LoopGuardResult } from "./types.ts";
export type { Queue, QueueDiagnostics } from "./queue.ts";
export type { LoopGuard } from "./guards.ts";
