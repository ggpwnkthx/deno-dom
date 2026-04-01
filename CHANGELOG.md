# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1-rc.0] - 2026-04-01

### Added

- `@ggpwnkthx/dom-shared` package with shared types, errors, and validation helpers
  - `errors.ts`: `DOMSharedError` base class, `NotImplementedError`, `ValidationError`, `InvariantError` subclasses, `Result<T, E>` discriminated union with `ok()` and `err()` helpers
  - `assert.ts`: `assertExists`, `assertNever`, `assertNotImplemented`, `assertString`, `assertNumber`, `assertFunction`, `assertBoolean`
  - `validation.ts`: `isString`, `isNumber`, `isFunction`, `isBoolean`, `isNonNull`, `isPromiseLike`, `requireString`, `requireNumber`, `requireFunction`, `requireNonNull`
  - `types.ts`: `Brand<T, Tag>` helper, `ContainerId`, `NodeId` branded types with `isContainerId` and `isNodeId` guard functions
  - Full test suite: 52 tests across 4 test files
