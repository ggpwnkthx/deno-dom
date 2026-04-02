# @ggpwnkthx/dom-hydrate

SSR hydration for aligning server-rendered DOM with client-side vnode trees.

## Status

**rc.1** — functional implementation with mismatch detection and event rebinding.

## Purpose

- Server-side rendered HTML hydration
- DOM tree walking and element matching
- SSR/client DOM reconciliation via `data-hk` markers
- Mismatch detection and reporting (`tag-mismatch`, `marker-mismatch`, `type-mismatch`, `missing-child`, `extra-child`, `extra-text`)
- Event handler rebinding without component remount
- Mismatch subtree replacement

## Usage

```typescript
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";

const mismatches: MismatchInfo[] = [];
hydrate(vnode, container, { onMismatch: (m) => mismatches.push(m) });
```

## Dependencies

- `@ggpwnkthx/dom-runtime` — DOM operations (createDom, setProp, setEventHandler)
- `@ggpwnkthx/dom-shared` — shared types, errors, and hydration path utilities
- `@ggpwnkthx/ssr` — SSR marker contract (`data-hk` attributes)
- `@ggpwnkthx/jsx` — VNode types (text, element, fragment, component)
