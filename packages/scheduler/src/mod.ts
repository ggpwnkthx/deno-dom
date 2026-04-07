/**
 * Microtask batching and rerender scheduling for efficient updates.
 *
 * @module
 *
 * @example
 * ```typescript
 * import {
 *   schedule,
 *   type Scheduler,
 *   type SchedulerConfig,
 * } from "@ggpwnkthx/dom-scheduler";
 *
 * // Schedule a rerender for a component
 * schedule((containerId: string) => {
 *   console.log("Rerendering container:", containerId);
 * }, "my-component-id");
 *
 * // Configure scheduler behavior
 * const config: SchedulerConfig = {
 *   timeout: 5000,
 *   maxUpdatesPerBatch: 50,
 * };
 * ```
 */

export * from "./scheduler.ts";
export * from "./types.ts";
export * from "./queue.ts";
export * from "./guards.ts";
export * from "./id.ts";
