/**
 * Type definitions for the scheduler including job, diagnostics, and configuration types.
 * @module
 */

/**
 * Deduplication key for update jobs. A job's dedupeKey prevents the same job
 * from running multiple times in a single flush cycle. Note: string and number
 * keys are distinct — "1" and 1 are different dedupe keys.
 */
export type DedupeKey = string | number;

/**
 * Represents a queued update job with a unique ID and optional dedupe key.
 */
export interface UpdateJob {
  readonly id: string;
  readonly dedupeKey?: DedupeKey;
  readonly fn: () => void;
}

/**
 * Diagnostic metrics for scheduler operation.
 */
export interface SchedulerDiagnostics {
  readonly enqueuedCount: number;
  readonly dequeuedCount: number;
  readonly deduplicatedCount: number;
  readonly flushCount: number;
  readonly nestedFlushCount: number;
  readonly loopGuardTriggers: number;
  readonly flushScheduled: boolean;
}

/**
 * Result of a loop guard reentrancy check.
 */
export type LoopGuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Configuration options for the scheduler.
 */
export interface SchedulerConfig {
  readonly maxLoopDepth?: number;
}

/**
 * Scheduler instance interface for queueing and flushing updates.
 */
export interface Scheduler {
  /**
   * Queues an update function to run asynchronously via microtask.
   * @param fn - The update function to queue
   * @param dedupeKey - Optional key to prevent duplicate updates in same flush
   */
  queueUpdate(fn: () => void, dedupeKey?: DedupeKey): void;
  /**
   * Alias for queueUpdate. Schedules an update function to run asynchronously.
   * @param fn - The update function to schedule
   * @param dedupeKey - Optional key to prevent duplicate updates in same flush
   */
  schedule(fn: () => void, dedupeKey?: DedupeKey): void;
  /**
   * Synchronously flushes all pending updates in the queue.
   */
  flushUpdates(): void;
  /**
   * Returns diagnostic metrics about scheduler operation.
   * @returns SchedulerDiagnostics including queue and loop guard metrics
   */
  getDiagnostics(): SchedulerDiagnostics;
  /**
   * Resets the scheduler state, clearing all pending updates.
   */
  reset(): void;
}
