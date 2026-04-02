/**
 * @ggpwnkthx/dom-hydrate - Hydration diagnostics.
 * @module
 */

import type { MismatchInfo, MismatchKind } from "./types.ts";

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

export function formatMismatch(info: MismatchInfo): string {
  let msg = `[Hydration] ${formatMismatchKind(info.kind)}`;
  msg += ` at path ${info.expectedPath}`;
  if (info.actualPath) {
    msg += ` (found path ${info.actualPath})`;
  }
  return msg;
}

export function warnMismatch(info: MismatchInfo): void {
  console.warn(formatMismatch(info));
}
