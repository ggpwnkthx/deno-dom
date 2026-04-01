import type { DedupeKey, UpdateJob } from "./types.ts";

export interface QueueDiagnostics {
  readonly enqueuedCount: number;
  readonly dequeuedCount: number;
  readonly deduplicatedCount: number;
}

export interface Queue {
  enqueue(job: UpdateJob): boolean;
  dequeueAll(): UpdateJob[];
  getDiagnostics(): QueueDiagnostics;
  reset(): void;
}

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
