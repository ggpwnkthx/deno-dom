/**
 * Unique ID generation for scheduler job tracking.
 * @module
 */

let _uidCounter = 0;

/**
 * Generates a unique job ID. Intentionally global and persistent across
 * scheduler instances — resetting would break ID uniqueness across microtask
 * boundaries.
 * @returns A unique string ID in the format "job_{counter}"
 */
export function nextId(): string {
  return `job_${++_uidCounter}`;
}
