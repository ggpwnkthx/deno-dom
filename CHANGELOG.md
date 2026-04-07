# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1-rc.12] - 2026-04-06

### Tests

- `@ggpwnkthx/dom-hydrate`: `diagnostics.test.ts` — exhaustive tests for `formatMismatchKind` (all 6 `MismatchKind` variants + unknown fallback) and `formatMismatch` (path inclusion, omitted actualPath)
- `@ggpwnkthx/dom-hydrate`: `extra-text.test.ts` — tests extra text node detection and removal, verifies `MismatchExtra` discriminated union shape (`vnode === null`, `domNode.nodeType`)
- `@ggpwnkthx/dom-hydrate`: `mismatch-handling.test.ts` — added `marker-mismatch` test (data-hk path does not match expected tree position), path assertions use validated `HydrationPath` via `parseHydrationPath`
- `@ggpwnkthx/dom-hydrate`: `no-ssr-fallback.test.ts` — tests fresh DOM creation when `container.firstElementChild` is absent, verifies dom ref attachment for all vnode types
- `@ggpwnkthx/dom-hydrate`: `props.test.ts` — tests prop reconciliation (stale attr removal, data-hk preservation) and event rebinding (handler invoked after hydration, handler rebound after node replacement)
- `@ggpwnkthx/dom-hydrate`: `_shared-test-helpers.ts` — shared `makePath(segments: string): HydrationPath` helper for consistent path fixture construction
- `@ggpwnkthx/dom-runtime`: `diff-children.test.ts` — tests `diffChildren` edge cases: empty old/new children arrays, null/undefined entries, text in-place updates
- `@ggpwnkthx/dom-runtime`: `dom-refs.test.ts` — tests `getDomRef`/`setDomRef`/`removeDomRef` behavior: null for unmounted vnodes, ref storage and retrieval, overwriting, clearing, fragment vnode returns null
- `@ggpwnkthx/dom-shared`: `hydration.test.ts` — tests `isHydrationPath`, `parseHydrationPath`, and `buildHydrationPath` for path validation, parsing, and construction

### Changed

- `@ggpwnkthx/dom-runtime`: Updated import version reference in README to `@0.0.1-rc.3`

## [0.0.1-rc.14] - 2026-04-07

### Added

- `@ggpwnkthx/dom-shared`: `parseHydrationPathFromString(value: string): HydrationPath | null` — validates a string against the `isHydrationPath` regex before returning a branded path; enables test helpers and external consumers to construct validated paths without DOM elements
- `@ggpwnkthx/dom-hydrate`: `isMismatchInfo(value: unknown): value is MismatchInfo` type guard with full runtime validation (kind string, valid `MismatchKind` variant, and valid `HydrationPath` for `expectedPath`)
- `@ggpwnkthx/dom-hydrate`: `isMismatchWithVNode(info: MismatchInfo): info is MismatchWithVNode` — narrows to vnode-bearing mismatch variants
- `@ggpwnkthx/dom-hydrate`: `isMismatchExtra(info: MismatchInfo): info is MismatchExtra` — narrows to extra-child/extra-text variants
- `@ggpwnkthx/dom-shared`: `buildHydrationPath` now validates its output at runtime, throwing `Error` if the constructed string fails `isHydrationPath` — provides defense-in-depth for the path factory
- `@ggpwnkthx/dom`: Root facade `src/mod.ts` — resolved the empty TODO export, now re-exports a curated public API surface from all four leaf packages: `hydrate`, `hydrateResult`, `HydrationError`, `MismatchInfo`, `MismatchKind`, `mount`, `patch`, `schedule`, `Scheduler`, `SchedulerConfig`, `Result`, `DOMSharedError`, `InvariantError`, `NotImplementedError`, `ValidationError`, `err`, `ok`

### Tests

- `@ggpwnkthx/dom-hydrate`: `type-guards.test.ts` — 13 tests covering all `isMismatchInfo`, `isMismatchWithVNode`, and `isMismatchExtra` behaviors (true positives, null, primitives, missing kind, unknown kind, malformed path, missing path)
- `@ggpwnkthx/dom-shared`: `hydration.test.ts` — 12 tests covering `isHydrationPath`, `parseHydrationPath`, `parseHydrationPathFromString`, and `buildHydrationPath`; added `parseHydrationPathFromString` coverage and a throw test for invalid constructed paths

### Changed

- `@ggpwnkthx/dom-hydrate`: All bare `as HydrationPath` casts at hydration call sites replaced with `buildHydrationPath(null, elementIndex)` — every path construction now routes through the validating factory; no unvalidated casts remain at call sites
- `@ggpwnkthx/dom-hydrate`: `isMismatchInfo` guard simplified by removing redundant `info.kind !== undefined` check (the `typeof info.kind === "string"` check already returns false for undefined)
- `@ggpwnkthx/dom-hydrate`: `isMismatchWithVNode` narrowed to `vnode !== null` (removed incorrect `domNode !== undefined` check that would reject valid `domNode: null` mismatches)
- `@ggpwnkthx/dom-hydrate`: `hydrate.ts` now imports `parseHydrationPath` (from element) instead of `parseHydrationPathFromString` for DOM-based path parsing
- `@ggpwnkthx/dom-hydrate`: `MismatchInfo` type guard and helpers exported from `hydrate/mod.ts` for consumer use
- `@ggpwnkthx/dom-shared`: `buildHydrationPath` signature unchanged but now includes runtime assertion

### Fixed

- `@ggpwnkthx/dom-hydrate`: `detectExtraChildren` call at `hydrate.ts:359` used `"0" as HydrationPath` for the root path — replaced with `buildHydrationPath(null, 0)` for consistency

### Documentation

- Root `README.md` updated to accurately describe the facade: curated API re-exporting from all four leaf packages, with a dependency direction diagram
- `@ggpwnkthx/dom-hydrate` README reflects that type guards (`isMismatchInfo`, `isMismatchWithVNode`, `isMismatchExtra`) are now part of the public API
- `@ggpwnkthx/dom-shared` README reflects that `parseHydrationPathFromString` is now exported

## [0.0.1-rc.13] - 2026-04-06

### Added

- `@ggpwnkthx/dom-hydrate`: `HydrationError` class — domain-specific error with typed `HydrationErrorCode` union (`INVALID_VNODE`, `MAX_DEPTH_EXCEEDED`, `NON_VNODE_CHILD`, `DETACHED_NODE`) and factory functions (`invalidVNodeError`, `maxDepthExceededError`, `nonVNodeChildError`, `detachedNodeError`)
- `@ggpwnkthx/dom-hydrate`: `hydrateResult(vnode, container, options?)` — alternative to `hydrate()` that returns `Result<VNode, HydrationError>` instead of throwing on invariant violations
- `@ggpwnkthx/dom-hydrate`: `errors.ts` module — internal module exporting `HydrationError` and factory functions

### Tests

- `@ggpwnkthx/dom-hydrate`: `hydrate-result.test.ts` — 11 tests covering `hydrateResult` success path, error paths (`INVALID_VNODE`, `MAX_DEPTH_EXCEEDED`, `NON_VNODE_CHILD`), error context preservation, and mismatch callback behavior

### Changed

- `@ggpwnkthx/dom-hydrate`: `hydrate()` now passes context `{ name: "vnode", value }` when throwing `InvariantError` for non-VNode input
- `@ggpwnkthx/dom-hydrate`: `mapInvariantToHydrationError` error mapping improved from `msg.includes()` string checks to regex patterns with capture groups

## [0.0.1-rc.11] - 2026-04-03

### Changed

- `@ggpwnkthx/dom-runtime`: `createElementNode` returns `Element` instead of `HTMLElement` for broader compatibility
- `@ggpwnkthx/dom-runtime`: Merged `remove-prop.ts` into `set-prop.ts` — `removeProp` and `setText` now exported from `set-prop.ts`
- `@ggpwnkthx/dom-runtime`: `normalizeAriaName` moved from `events.ts` to new `dom/utils.ts` module
- `@ggpwnkthx/dom-runtime`: `setEventHandler` now validates handler types and uses `InvariantError` instead of plain `Error`
- `@ggpwnkthx/dom-runtime`: `mount.ts` handles fragment vnode mounting with explicit start index tracking
- `@ggpwnkthx/dom-runtime`: Fragment children now use direct array iteration instead of `forEachChild` utility

### Added

- `@ggpwnkthx/dom-runtime`: `dom/utils.ts` module with `normalizeAriaName` helper function
- `@ggpwnkthx/dom-runtime`: `diffFragmentChildren` in `diff-children.ts` for fragment-specific diffing with start index
- `@ggpwnkthx/dom-runtime`: Fragment range tracking via `fragmentRanges` WeakMap in `types.ts` — enables `getFragmentRange` to retrieve parent and start index
- `@ggpwnkthx/dom-runtime`: `setFragmentRef` exported for storing fragment mounting metadata
- `@ggpwnkthx/dom-runtime`: Fragment patching support in `patchFragment` using `getFragmentRange` for range-based child diffing
- `@ggpwnkthx/dom-runtime`: `tests/fragment.test.ts` for fragment mounting and patching behavior
- `@ggpwnkthx/dom-runtime`: `tests/dom-test-environment.ts` shared test environment for DOM globals initialization

### Fixed

- `@ggpwnkthx/dom-runtime`: `setProp`/`removeProp` on event props now throw `InvariantError` (was plain `Error`)
- `@ggpwnkthx/dom-runtime`: Event handler cleanup correctly checks `typeof oldHandler === 'function'` before removing

### Tests

- `@ggpwnkthx/dom-runtime`: All tests updated to use shared `env.createContainer()` for DOM globals initialization
- `@ggpwnkthx/dom-runtime`: Replaced `assertInstanceOf` with `assertEquals(nodeType, Node.ELEMENT_NODE)` assertions
- `@ggpwnkthx/dom-runtime`: Replaced `el.click()` with `el.dispatchEvent(new Event("click", { bubbles: true }))` for event testing

## [0.0.1-rc.10] - 2026-04-03

### Fixed

- `@ggpwnkthx/dom-scheduler`: `doFlush()` now uses `try/finally` to guarantee depth restoration when a job throws — prevents dirty loop guard state that silently corrupts subsequent flushes
- `@ggpwnkthx/dom-scheduler`: Removed duplicate loop guard boundary test; renamed remaining boundary test to accurately reflect the `checkReentrancy` behavior

### Added

- `@ggpwnkthx/dom-scheduler`: `queueUpdate()` validates `fn` is a function (`TypeError`) and `dedupeKey` is a string or number (`TypeError`) — `schedule` inherits validation as a true alias
- `@ggpwnkthx/dom-scheduler`: `createLoopGuard()` validates `maxLoopDepth` is a positive integer (`ValidationError`) — rejects `-1`, `0`, non-integers, `NaN`, `Infinity`, and non-number types
- `@ggpwnkthx/dom-scheduler`: `createScheduler()` (public API) also validates `maxLoopDepth` at the user-facing entry point
- `@ggpwnkthx/dom-scheduler`: Strengthened thrown-job recovery test — uses `maxLoopDepth: 1` and asserts `nestedFlushCount === 0` after recovery, exposing the real failure mode
- `@ggpwnkthx/dom-scheduler`: `InvariantError` boundary test for loop guard rejection — directly asserts the specific error type

### Cleanup

- `@ggpwnkthx/dom-scheduler`: Removed unused `internalDiagnostics.nestedFlushCount` and `loopGuardTriggers` fields — diagnostics now sourced exclusively from `loopGuard.getDiagnostics()`

### Documentation

- `@ggpwnkthx/dom-scheduler`: Added `flushSync` comment documenting intentional exception propagation
- `@ggpwnkthx/dom-scheduler`: Added `flushScheduled` comment explaining its deduplication semantics
- `@ggpwnkthx/dom-scheduler`: Added `currentDepth` comment explaining its relationship to `loopGuard`

## [0.0.1-rc.9] - 2026-04-03

### Tests

- `@ggpwnkthx/dom-scheduler`: Complete test suite rewrite — deleted single `scheduler.test.ts`, added four focused test files: `guards.test.ts` (loop guard bookkeeping and rejection), `queue.test.ts` (FIFO, dedupe, diagnostics), `instance.test.ts` (microtask batching, sync flush, generation/reset invalidation, thrown-job recovery), `scheduler.test.ts` (global facade smoke tests)
- `@ggpwnkthx/dom-scheduler`: 47 tests total across 4 files, all using `createScheduler()` directly for instance tests to avoid singleton leakage

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
