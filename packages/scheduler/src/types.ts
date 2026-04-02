/**
 * Deduplication key for update jobs. A job's dedupeKey prevents the same job
 * from running multiple times in a single flush cycle. Note: string and number
 * keys are distinct — "1" and 1 are different dedupe keys.
 */
export type DedupeKey = string | number;

export interface UpdateJob {
  readonly id: string;
  readonly dedupeKey?: DedupeKey;
  readonly fn: () => void;
}

export interface SchedulerDiagnostics {
  readonly enqueuedCount: number;
  readonly dequeuedCount: number;
  readonly deduplicatedCount: number;
  readonly flushCount: number;
  readonly nestedFlushCount: number;
  readonly loopGuardTriggers: number;
  readonly flushScheduled: boolean;
}

export type LoopGuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export interface SchedulerConfig {
  readonly maxLoopDepth?: number;
}

export interface Scheduler {
  queueUpdate(fn: () => void, dedupeKey?: DedupeKey): void;
  schedule(fn: () => void, dedupeKey?: DedupeKey): void;
  flushUpdates(): void;
  getDiagnostics(): SchedulerDiagnostics;
  reset(): void;
}
