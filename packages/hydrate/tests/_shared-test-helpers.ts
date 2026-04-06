import { type HydrationPath, parseHydrationPath } from "@ggpwnkthx/dom-shared";

export function makePath(segments: string): HydrationPath {
  const el = document.createElement("div");
  el.setAttribute("data-hk", segments);
  return parseHydrationPath(el)!;
}
