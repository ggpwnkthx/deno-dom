# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1-rc.2] - 2026-04-02

### Added

- `@ggpwnkthx/dom-runtime` package with client-side DOM mount and patch behavior
  - `src/types.ts`: `getDomRef`, `setDomRef`, `removeDomRef` for WeakMap-based DOM reference management; re-exports vnode types and guards from `@ggpwnkthx/jsx`
  - `src/dom.ts`: `createDom`, `setProp`, `removeProp`, `setText`, `replaceNode` for low-level DOM creation and prop application
  - `src/events.ts`: `isEventProp`, `normalizeEventName`, `addEventListener`, `removeEventListener`, `setEventHandler` for event binding
  - `src/mount.ts`: `mount(vnode, container)` for initial DOM creation and insertion
  - `src/patch.ts`: `patch(oldVNode, newVNode, domNode, parentDom)` for incremental DOM updates
  - `src/mod.ts`: Public entry point exporting `mount`, `patch`, and `VNode` type
  - Full test suite: 35 tests covering DOM creation, event binding, mount behavior, and patch updates
  - Canonical vnode types sourced from `@ggpwnkthx/jsx` — no parallel vnode model
  - WeakMap DOM reference strategy (does not mutate upstream vnode objects)
  - Depth guards (1000) to prevent stack overflow on deep vnode trees
  - `isVNode` entry validation on `mount` and `patch` with descriptive error messages
  - `nodeType` validation in `patch()` for text, element, and fragment vnodes
  - Event handler cleanup in `setEventHandler` (removes old before adding new)
  - `aria-*` attribute support via DOM property assignment
  - `id`, `class`, `value`, `checked`, `selected`, `data-*`, `style` prop handling
  - Child patching by index with `removeDomRef` cleanup on removal

## [0.0.1-rc.1] - 2026-04-01

### Added

- `@ggpwnkthx/dom-scheduler` package with microtask batching and rerender scheduling
  - `types.ts`: `DedupeKey`, `UpdateJob`, `SchedulerDiagnostics`, `LoopGuardResult`, `SchedulerConfig`, `Scheduler` interface
  - `queue.ts`: `Queue` and `QueueDiagnostics` with enqueue/dequeue, per-flush dedupe bookkeeping
  - `guards.ts`: `LoopGuard` with re-entrancy tracking and max-depth enforcement
  - `scheduler.ts`: `queueUpdate()`, `schedule()`, `flushUpdates()`, `getDiagnostics()`, `resetScheduler()`, `createScheduler()`
  - Microtask batching with generation-based stale microtask invalidation on reset
  - Loop guard throws `InvariantError` when max re-entrancy depth is exceeded
  - Full test suite: 14 tests covering batching, deduplication, flush ordering, nested flushes, self-scheduling, throwing jobs, diagnostics, and reset

## [0.0.1-rc.0] - 2026-04-01

### Added

- `@ggpwnkthx/dom-shared` package with shared types, errors, and validation helpers
  - `errors.ts`: `DOMSharedError` base class, `NotImplementedError`, `ValidationError`, `InvariantError` subclasses, `Result<T, E>` discriminated union with `ok()` and `err()` helpers
  - `assert.ts`: `assertExists`, `assertNever`, `assertNotImplemented`, `assertString`, `assertNumber`, `assertFunction`, `assertBoolean`
  - `validation.ts`: `isString`, `isNumber`, `isFunction`, `isBoolean`, `isNonNull`, `isPromiseLike`, `requireString`, `requireNumber`, `requireFunction`, `requireNonNull`
  - `types.ts`: `Brand<T, Tag>` helper, `ContainerId`, `NodeId` branded types with `isContainerId` and `isNodeId` guard functions
  - Full test suite: 52 tests across 4 test files
