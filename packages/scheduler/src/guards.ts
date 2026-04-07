/**
 * Loop guard for preventing infinite re-render cycles during flush operations.
 * @module
 */

import { ValidationError } from "@ggpwnkthx/dom-shared";
import type {
  LoopGuardResult,
  SchedulerConfig,
  SchedulerDiagnostics,
} from "./types.ts";

/**
 * Monitors flush cycle depth to detect and prevent infinite re-render loops.
 * Tracks nesting count and triggers when maxLoopDepth is exceeded.
 */
export interface LoopGuard {
  /**
   * Checks if reentrancy is allowed at current depth.
   * @returns LoopGuardResult indicating if flush can proceed
   */
  checkReentrancy(): LoopGuardResult;
  /**
   * Records current depth after entering a flush cycle.
   */
  recordDepth(): void;
  /**
   * Restores depth when exiting a flush cycle.
   * @param previousDepth - The depth to restore to
   */
  restoreDepth(previousDepth: number): void;
  /**
   * Returns diagnostic metrics about loop guard operation.
   * @returns Pick of SchedulerDiagnostics for nestedFlushCount and loopGuardTriggers
   */
  getDiagnostics(): Pick<
    SchedulerDiagnostics,
    "nestedFlushCount" | "loopGuardTriggers"
  >;
  /**
   * Resets the loop guard state.
   */
  reset(): void;
}

/**
 * Default maximum depth before the loop guard triggers.
 */
const DEFAULT_MAX_LOOP_DEPTH = 100;

/**
 * Creates a LoopGuard instance to prevent infinite re-render loops.
 * @param config - Optional scheduler configuration with maxLoopDepth
 * @returns A LoopGuard instance
 * @throws {ValidationError} If maxLoopDepth is not a positive integer
 */
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
