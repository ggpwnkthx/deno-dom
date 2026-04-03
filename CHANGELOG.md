# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1-rc.8] - 2026-04-03

### Added

- `@ggpwnkthx/dom-runtime`: `removeProp` function exported for attribute removal
- `@ggpwnkthx/dom-runtime`: `getDomRef` now returns `Node | null` (previously always returned Node)

### Changed

- `@ggpwnkthx/dom-hydrate`: Refactored fragment hydration with dedicated `hydrateFragmentRoot` and `hydrateNestedFragmentChildren` functions
- `@ggpwnkthx/dom-hydrate`: `hydrateChildrenInternal` return type changed from `{ elementIndex, domIndex }` to `{ elementCount, domIndex }`
- `@ggpwnkthx/dom-hydrate`: Added `HYDRATION_MARKER` constant for attribute comparison
- `@ggpwnkthx/dom-hydrate`: Prop removal now removes attributes not present in vnode props (attribute cleanup)
- `@ggpwnkthx/dom-hydrate`: `actualPath` added to mismatch info with `undefined` for vnode-related mismatches
- `@ggpwnkthx/dom-hydrate`: `MismatchKind` split into `MismatchKindWithVNode` and `MismatchKindExtra` with corresponding `MismatchWithVNode` and `MismatchExtra` interfaces

### Fixed

- `@ggpwnkthx/dom-hydrate`: Fragment root hydration now properly walks all children including nested fragments and text nodes
- `@ggpwnkthx/dom-hydrate`: `replaceWith` no longer sets dom ref for fragment vnodes
- `@ggpwnkthx/dom-hydrate`: Removed `countFragmentElements` helper (replaced by proper element counting via hydration result)
- `@ggpwnkthx/dom-hydrate`: Added validation that hydrate children are VNodes (throws `InvariantError` otherwise)

### Tests

- `@ggpwnkthx/dom-hydrate`: Reorganized test suite — deleted `hydrate.test.ts`, added focused test files: `basic-hydration.test.ts`, `comments.test.ts`, `error-handling.test.ts`, `extra-children.test.ts`, `fragments.test.ts`, `mismatch-handling.test.ts`, `missing-children.test.ts`, `test-environment.ts`, `text-nodes.test.ts`

## [0.0.1-rc.7] - 2026-04-03

### Added

- `@ggpwnkthx/dom-shared`: New `forEachChild` utility for shared child traversal logic
- `@ggpwnkthx/dom-hydrate`: `createDomDeep` function for recursive DOM creation in replacement scenarios
- `@ggpwnkthx/dom-hydrate`: `appendChildren` helper using shared `forEachChild`
- `@ggpwnkthx/dom-hydrate`: `countFragmentElements` helper for fragment element counting
- `@ggpwnkthx/dom-hydrate`: 13 comprehensive hydration tests covering exact match, type mismatch, text drift, consecutive extras, fragment flattening, and nested fragments
- `@ggpwnkthx/dom-hydrate`: Added `@ggpwnkthx/dom-shared` import for shared utilities

### Changed

- `@ggpwnkthx/dom-hydrate`: Refactored `hydrateChildren` into `hydrateChildren` entry point and `hydrateChildrenInternal` returning element/dom indices
- `@ggpwnkthx/dom-hydrate`: `hydrateElementNode` now uses `vnode.children` instead of `vnode.props?.children` for consistency
- `@ggpwnkthx/dom-hydrate`: Children access aligned across hydrate and mount—read from `vnode.children` directly
- `@ggpwnkthx/dom-runtime`: `mount.ts` now uses shared `forEachChild` utility with fallback from `props.children` to `children`
- `@ggpwnkthx/dom-hydrate`: Type imports use `TextVNode`, `ElementVNode`, `FragmentVNode` from `@ggpwnkthx/jsx`

### Fixed

- `@ggpwnkthx/dom-hydrate`: Text drift now patched in place when text content differs (preserves Text node reference)
- `@ggpwnkthx/dom-hydrate`: Consecutive extra nodes both removed correctly (`i--` fix after `domNode.remove()`)
- `@ggpwnkthx/dom-hydrate`: Fragment element index tracking fixed with `startElementIndex`/`startDomIndex` propagation
- `@ggpwnkthx/dom-hydrate`: Nested fragment flattening works correctly—text nodes and elements at all nesting levels preserved
- `@ggpwnkthx/dom-hydrate`: `domIndex` properly incremented after text replacement to prevent `detectExtraChildren` from removing just-inserted nodes
- `@ggpwnkthx/dom-hydrate`: `@std/assert` import alias added to package imports

## [0.0.1-rc.6] - 2026-04-02

### Changed

- `@ggpwnkthx/dom-hydrate`: Removed `contract.ts` documentation (content migrated to README.md)
- `@ggpwnkthx/dom-hydrate`: Import path migration from `jsr:@ggpwnkthx/jsx@0.1.8` to `@ggpwnkthx/jsx`
- `@ggpwnkthx/dom-runtime`: Import path migration from `jsr:@ggpwnkthx/jsx@0.1.8` to `@ggpwnkthx/jsx`
- `@ggpwnkthx/dom-runtime`: Re-exported vnode guards (`isVNode`, `isElementVNode`, etc.) from `@ggpwnkthx/jsx` directly instead of duplicating
- `@ggpwnkthx/dom-runtime`: `removeProp` signature simplified — dead `_oldValue` parameter removed
- All packages: Test import paths updated to use `@ggpwnkthx/jsx` bare specifier

### Fixed

- `@ggpwnkthx/dom-hydrate`: Removed unused `jsr:@ggpwnkthx/ssr@0.1.1` dependency
- `@ggpwnkthx/dom-hydrate`: Added missing `@b-fuze/deno-dom` for DOM type references

## [0.0.1-rc.5] - 2026-04-02

### Changed

- All test files renamed from `*.test.ts` to `*.test.ts` (consistent naming convention)
- `@ggpwnkthx/dom-runtime`: Source files reorganized into focused subdirectories
  - `src/dom.ts` → `src/dom/` directory with `set-prop.ts`, `remove-prop.ts` modules
  - `src/patch.ts` → `src/patch/` directory with `text.ts`, `props.ts`, `fragment.ts`, `diff-children.ts` modules
- `@ggpwnkthx/dom-scheduler`: Scheduler instance refactored into `src/instance.ts` module

## [0.0.1-rc.4] - 2026-04-02

### Changed

- `@ggpwnkthx/dom-runtime`: Refactored large source files into focused modules for maintainability
  - `src/dom.ts`: Split into `dom-set-prop.ts` (setProp), `dom-remove-prop.ts` (removeProp, setText)
  - `src/patch.ts`: Split into `patch-text.ts` (patchText), `patch-props.ts` (patchProps), `patch-fragment.ts` (patchFragment), `diff-children.ts` (diffChildren, PatchFn type)
  - `src/patch.ts` reduced from 247 to 136 lines; all new files under 140 lines
- `@ggpwnkthx/dom-scheduler`: Refactored scheduler instance into standalone module
  - `src/scheduler.ts`: Split into `scheduler-instance.ts` (createSchedulerInstance) and `scheduler-global.ts` (global singleton); `src/id.ts` extracted for ID generation
  - Fixed `flushScheduled` deduplication bug: microtask now correctly sets flag before scheduling and resets after flush
  - Added `flushScheduled` to `SchedulerDiagnostics` for debugging
  - Removed dead `flushCount` local variable from scheduler instance

### Fixed

- `@ggpwnkthx/dom-runtime`: Runtime validation that event handler props are callable functions before passing to setEventHandler
- `@ggpwnkthx/dom-scheduler`: `flushScheduled` deduplication gate now functional — multiple queueUpdate calls before microtask runs are now correctly deduplicated

### Added

- `@ggpwnkthx/dom-runtime`: `PatchFn` type exported from `diff-children.ts` for external consumers
- `@ggpwnkthx/dom-runtime`: `removeProp` signature simplified — dead `_oldValue` parameter removed

## [0.0.1-rc.3] - 2026-04-02

### Added

- `@ggpwnkthx/dom-hydrate` package for SSR hydration
  - `src/types.ts`: `MismatchKind` union (6 variants), `MismatchInfo` interface with `vnode: VNode | null`, `path`, `kind`, `domNode`
  - `src/contract.ts`: JSDoc documentation of marker semantics, shape matching rules, mismatch categories, replacement policy, fragment handling
  - `src/diagnostics.ts`: `formatMismatchKind`, `formatMismatch`, `warnMismatch` for mismatch reporting
  - `src/hydrate.ts`: Core implementation — `hydrate()`, `hydrateElement()`, `hydrateTextNode()`, `hydrateElementNode()`, `hydrateFragmentNode()`, `hydrateComponentNode()`, `hydrateChildren()`, `detectExtraChildren()`, `applyProps()`, `replaceWith()`
  - `src/mod.ts`: Public entry point exporting `hydrate`, `MismatchInfo`, `MismatchKind`, `HydrateOptions`
  - Full test suite: 13 tests covering all mismatch types, field validation, DOM removal, event rebinding
  - `data-hk` marker alignment via dot-separated hydration paths
  - Dual-cursor DOM walking algorithm with `elementIndex`/`domIndex` invariant
  - Event handler rebinding without component remount via `setEventHandler`
  - `extra-child`/`extra-text` mismatch detection with DOM node removal
  - `replaceWith` with fail-fast on detached nodes
  - Depth guard (`MAX_HYDRATE_DEPTH`) to prevent stack overflow
  - Typed error hierarchy via `InvariantError`
- `@ggpwnkthx/dom-shared` additions:
  - `src/hydration.ts`: `HYDRATION_ATTR` constant, `HydrationPath` branded type, `isHydrationPath()`, `parseHydrationPath()`, `buildHydrationPath()`
  - Updated `mod.ts` exports for hydration helpers
- `@ggpwnkthx/dom-runtime` additions:
  - Extended `mod.ts` exports: `isVNode`, `isElementVNode`, `isFragmentVNode`, `isTextVNode`, `isComponentVNode`, `createDom`, `setDomRef`, `getDomRef`, `setProp`, `setEventHandler`, `isEventProp`

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
