# @ggpwnkthx/dom-scheduler

Microtask batching and rerender scheduling.

## Status

**Implemented** — microtask batching, deduplication, and rerender scheduling.

## Purpose

- Microtask-based update batching
- Rerender scheduling and prioritization
- Task queue management
- Frame-synchronized updates

## Note

This package should remain isolated from direct DOM manipulation. It schedules updates that `@ggpwnkthx/dom-runtime` executes.
