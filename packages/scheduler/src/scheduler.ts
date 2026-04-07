/**
 * Global scheduler functions for queueing and flushing microtask updates.
 * @module
 */

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

/**
 * Queues an update function to run asynchronously via microtask.
 * @param fn - The update function to queue
 * @param dedupeKey - Optional key to prevent duplicate updates in same flush
 * @example
 * ```ts
 * queueUpdate(() => {
 *   console.log("Update flushed!");
 * });
 * ```
 */
export function queueUpdate(fn: () => void, dedupeKey?: DedupeKey): void {
  getGlobalScheduler().queueUpdate(fn, dedupeKey);
}

/**
 * Alias for queueUpdate. Schedules an update function to run asynchronously.
 * @param fn - The update function to schedule
 * @param dedupeKey - Optional key to prevent duplicate updates in same flush
 * @example
 * ```ts
 * schedule(() => {
 *   // Re-render component
 * }, "update-vnode");
 * ```
 */
export function schedule(fn: () => void, dedupeKey?: DedupeKey): void {
  getGlobalScheduler().schedule(fn, dedupeKey);
}

/**
 * Synchronously flushes all pending updates in the queue.
 * @example
 * ```ts
 * queueUpdate(() => console.log("1"));
 * queueUpdate(() => console.log("2"));
 * flushUpdates(); // Logs "1" then "2" synchronously
 * ```
 */
export function flushUpdates(): void {
  getGlobalScheduler().flushUpdates();
}

/**
 * Returns diagnostic metrics about scheduler operation.
 * @returns SchedulerDiagnostics including queue and loop guard metrics
 * @example
 * ```ts
 * const diag = getDiagnostics();
 * console.log(`Enqueued: ${diag.enqueuedCount}, Flushes: ${diag.flushCount}`);
 * ```
 */
export function getDiagnostics(): SchedulerDiagnostics {
  return getGlobalScheduler().getDiagnostics();
}

/**
 * Resets the global scheduler state, clearing all pending updates.
 * Primarily useful for testing scenarios.
 * @example
 * ```ts
 * resetScheduler();
 * ```
 */
export function resetScheduler(): void {
  if (_globalScheduler) {
    _globalScheduler.reset();
  }
}

/**
 * Creates a new scheduler instance with optional configuration.
 * @param config - Optional scheduler configuration
 * @returns A new Scheduler instance
 * @example
 * ```ts
 * const scheduler = createScheduler({ maxLoopDepth: 50 });
 * scheduler.queueUpdate(() => console.log("Custom scheduler!"));
 * scheduler.flushUpdates();
 * ```
 */
export function createScheduler(config?: SchedulerConfig): Scheduler {
  return createSchedulerInstance(config);
}
