import { ValidationError } from "@ggpwnkthx/dom-shared";
import type {
  LoopGuardResult,
  SchedulerConfig,
  SchedulerDiagnostics,
} from "./types.ts";

export interface LoopGuard {
  checkReentrancy(): LoopGuardResult;
  recordDepth(): void;
  restoreDepth(previousDepth: number): void;
  getDiagnostics(): Pick<
    SchedulerDiagnostics,
    "nestedFlushCount" | "loopGuardTriggers"
  >;
  reset(): void;
}

const DEFAULT_MAX_LOOP_DEPTH = 100;

export function createLoopGuard(config: SchedulerConfig = {}): LoopGuard {
  if (
    config.maxLoopDepth !== undefined
    && (typeof config.maxLoopDepth !== "number"
      || !Number.isInteger(config.maxLoopDepth) || config.maxLoopDepth < 1)
  ) {
    throw new ValidationError(
      `maxLoopDepth must be a positive integer, got ${config.maxLoopDepth}`,
      { name: "maxLoopDepth", value: config.maxLoopDepth },
    );
  }
  let depth = 0;
  let nestedFlushCount = 0;
  let loopGuardTriggers = 0;
  const maxDepth = config.maxLoopDepth ?? DEFAULT_MAX_LOOP_DEPTH;

  return {
    checkReentrancy(): LoopGuardResult {
      // Fires when the next flush would exceed maxDepth. Allows depth to reach
      // maxDepth; triggers on the subsequent flush that would exceed it.
      if (depth >= maxDepth) {
        loopGuardTriggers++;
        return {
          allowed: false,
          reason: `Loop guard triggered: max depth ${maxDepth} exceeded`,
        };
      }
      return { allowed: true };
    },
    recordDepth(): void {
      if (depth > 0) {
        nestedFlushCount++;
      }
      depth++;
    },
    restoreDepth(previousDepth: number): void {
      depth = previousDepth;
    },
    getDiagnostics(): Pick<
      SchedulerDiagnostics,
      "nestedFlushCount" | "loopGuardTriggers"
    > {
      return { nestedFlushCount, loopGuardTriggers };
    },
    reset(): void {
      depth = 0;
      nestedFlushCount = 0;
      loopGuardTriggers = 0;
    },
  };
}
