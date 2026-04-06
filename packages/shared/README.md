# @ggpwnkthx/dom-shared

Shared types, errors, and validation helpers used across the DOM package family.

## Status

**Implemented** — shared types, errors, validation helpers, hydration path utilities, `Result<E, T>` type, and vnode child traversal.

## Purpose

- Shared type definitions
- Typed error shapes (`DOMSharedError`, `ValidationError`, `InvariantError`, `NotImplementedError`)
- `Result<T, E>` discriminated union for error-returning APIs
- Centralized validation helpers
- Cross-package internal conventions

## Note

This package should only contain genuinely cross-cutting code. Implementation logic belongs in leaf packages.
