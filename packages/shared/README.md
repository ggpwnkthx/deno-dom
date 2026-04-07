# @ggpwnkthx/dom-shared

Shared types, errors, and validation helpers used across the DOM package family.

## Status

**Implemented** — shared types, errors, validation helpers, hydration path utilities, `Result<E, T>` type, and vnode child traversal.

## Purpose

- Shared type definitions
- Typed error shapes (`DOMSharedError`, `ValidationError`, `InvariantError`, `NotImplementedError`)
- `Result<T, E>` discriminated union for error-returning APIs
- Centralized validation helpers
- Hydration path utilities: `HydrationPath` branded type, `isHydrationPath`, `parseHydrationPath`, `parseHydrationPathFromString`, `buildHydrationPath`
- Cross-package internal conventions

## Usage

```typescript
import {
  assertString,
  DOMSharedError,
  err,
  HydrationPath,
  InvariantError,
  isHydrationPath,
  ok,
  type Result,
  ValidationError,
} from "jsr:@ggpwnkthx/dom-shared@^0.0.2";

// Result type for error-returning APIs
function divide(a: number, b: number): Result<string, number> {
  if (b === 0) return err("division by zero");
  return ok(a / b);
}

// Typed errors
try {
  throw new ValidationError("field is required", { field: "email" });
} catch (e) {
  if (e instanceof DOMSharedError) {
    console.error(e.code); // "VALIDATION_ERROR"
  }
}

// Hydration path utilities
const path = parseHydrationPath("0.1.2");
if (isHydrationPath(path)) {
  console.log(buildHydrationPath(path)); // "0.1.2"
}
```

## Note

This package should only contain genuinely cross-cutting code. Implementation logic belongs in leaf packages.
