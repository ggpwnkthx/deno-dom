/**
 * Job queue implementation with deduplication support.
 * @module
 */

import type { DedupeKey, UpdateJob } from "./types.ts";

/**
 * Diagnostic metrics for queue operations.
 */
export interface QueueDiagnostics {
  readonly enqueuedCount: number;
  readonly dequeuedCount: number;
  readonly deduplicatedCount: number;
}

/**
 * Queue for managing update jobs with deduplication support.
 */
export interface Queue {
  /**
   * Enqueues a job, returning false if deduplicated.
   * @param job - The update job to enqueue
   * @returns True if enqueued, false if deduplicated
   */
  enqueue(job: UpdateJob): boolean;
  /**
   * Dequeues and returns all pending jobs.
   * @returns Array of all pending UpdateJobs
   */
  dequeueAll(): UpdateJob[];
  /**
   * Returns diagnostic metrics about queue operation.
   * @returns QueueDiagnostics including enqueued, dequeued, and deduplicated counts
   */
  getDiagnostics(): QueueDiagnostics;
  /**
   * Resets the queue state, clearing all pending jobs.
   */
  reset(): void;
}

/**
 * Creates a new Queue instance for managing update jobs.
 * @returns A new Queue instance
 */
export function createQueue(): Queue {
  const pending: UpdateJob[] = [];
  const dedupeSet = new Set<DedupeKey>();
  let enqueuedCount = 0;
  let dequeuedCount = 0;
  let deduplicatedCount = 0;

  return {
    enqueue(job: UpdateJob): boolean {
      enqueuedCount++;
      if (job.dedupeKey !== undefined) {
        if (dedupeSet.has(job.dedupeKey)) {
          deduplicatedCount++;
          return false;
        }
        dedupeSet.add(job.dedupeKey);
      }
      pending.push(job);
      return true;
    },
    dequeueAll(): UpdateJob[] {
      const jobs = pending.splice(0, pending.length);
      dequeuedCount += jobs.length;
      dedupeSet.clear();
      return jobs;
    },
    getDiagnostics(): QueueDiagnostics {
      return {
        enqueuedCount,
        dequeuedCount,
        deduplicatedCount,
      };
    },
    reset(): void {
      pending.splice(0, pending.length);
      dedupeSet.clear();
      enqueuedCount = 0;
      dequeuedCount = 0;
      deduplicatedCount = 0;
    },
  };
}
