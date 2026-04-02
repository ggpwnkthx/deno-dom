/**
 * @ggpwnkthx/dom-scheduler - Unique ID generation.
 * @module
 */

// Intentionally global and persistent across scheduler instances.
// Resetting would break ID uniqueness across microtask boundaries.
let _uidCounter = 0;

export function nextId(): string {
  return `job_${++_uidCounter}`;
}
