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

## Facade API

This package re-exports a curated subset of APIs from the leaf packages for common use cases. For lower-level or advanced APIs, import directly from the specific package.

```typescript
import {
  DOMSharedError,
  err,
  hydrate,
  hydrateResult,
  HydrationError,
  InvariantError,
  type MismatchInfo,
  mount,
  ok,
  patch,
  type Result,
  schedule,
  type Scheduler,
  ValidationError,
} from "jsr:@ggpwnkthx/dom@^0.0.1";
```

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
