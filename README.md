# @ggpwnkthx/dom

Umbrella package for the browser-facing DOM package family.

[![CI](https://github.com/ggpwnkthx/deno-dom/actions/workflows/ci.yml/badge.svg)](https://github.com/ggpwnkthx/deno-dom/actions/workflows/ci.yml)
[![Deno v2.7+](https://img.shields.io/badge/Deno-2.7+-lightgrey?logo=deno)](https://deno.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Package Family

This workspace contains the following packages:

| Package                    | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `@ggpwnkthx/dom-shared`    | Shared types, errors, and validation helpers |
| `@ggpwnkthx/dom-runtime`   | Client DOM mount and patch behavior          |
| `@ggpwnkthx/dom-hydrate`   | SSR hydration behavior                       |
| `@ggpwnkthx/dom-scheduler` | Microtask batching and rerender scheduling   |

## Status

**Scaffold/skeleton phase** — no DOM logic is implemented yet.

## Dependency Direction

```text
@ggpwnkthx/dom (facade)
 ├─ @ggpwnkthx/dom-runtime
 ├─ @ggpwnkthx/dom-hydrate
 ├─ @ggpwnkthx/dom-scheduler
 └─ @ggpwnkthx/dom-shared

@ggpwnkthx/dom-runtime   → @ggpwnkthx/dom-shared
@ggpwnkthx/dom-hydrate   → @ggpwnkthx/dom-runtime, @ggpwnkthx/dom-shared
@ggpwnkthx/dom-scheduler → @ggpwnkthx/dom-shared (optional)
```

## Quick Start

```typescript
import { ... } from "jsr:@ggpwnkthx/dom";
```

## Note

This is the root facade package. It re-exports stable public APIs from leaf packages. Implementation logic lives in the leaf packages.

## Recommended Follow-on Build Plan Order

1. `@ggpwnkthx/dom-shared`
2. `@ggpwnkthx/dom-scheduler`
3. `@ggpwnkthx/dom-runtime`
4. `@ggpwnkthx/dom-hydrate`
