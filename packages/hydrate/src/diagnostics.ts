/**
 * Hydration diagnostics for formatting and reporting mismatch information.
 * @module
 */

import type { MismatchInfo, MismatchKind } from "./types.ts";

/**
 * Formats a MismatchKind into a human-readable label.
 * @param kind - The mismatch kind to format
 * @returns A human-readable label for the mismatch kind
 */
export function formatMismatchKind(kind: MismatchKind): string {
  const labels: Record<MismatchKind, string> = {
    "tag-mismatch": "Tag mismatch",
    "marker-mismatch": "Hydration marker mismatch",
    "type-mismatch": "Node type mismatch",
    "missing-child": "Missing child node",
    "extra-child": "Extra child node",
    "extra-text": "Extra text node",
  };
  return labels[kind] ?? "Unknown mismatch";
}

/**
 * Formats a MismatchInfo into a human-readable message.
 * @param info - The mismatch info to format
 * @returns A formatted message describing the mismatch
 */
export function formatMismatch(info: MismatchInfo): string {
  let msg = `[Hydration] ${formatMismatchKind(info.kind)}`;
  msg += ` at path ${info.expectedPath}`;
  if (info.actualPath) {
    msg += ` (found path ${info.actualPath})`;
  }
  return msg;
}

/**
 * Logs a hydration mismatch warning to the console.
 * @param info - The mismatch info to warn about
 */
export function warnMismatch(info: MismatchInfo): void {
  console.warn(formatMismatch(info));
}
