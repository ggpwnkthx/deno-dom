# @ggpwnkthx/dom-hydrate

SSR hydration for aligning server-rendered DOM with client-side vnode trees.

## Status

Functional implementation with mismatch detection and event rebinding.

## Purpose

- Server-side rendered HTML hydration
- DOM tree walking and element matching
- SSR/client DOM reconciliation via `data-hk` markers
- Mismatch detection and reporting
- Event handler rebinding without component remount
- Mismatch subtree replacement

## Hydration Markers

SSR output from `@ggpwnkthx/ssr` uses `data-hk` attributes with dot-separated path notation to mark element nodes. Hydration uses these markers to align vnode trees with existing DOM.

### Path Format

- Root element: `data-hk="0"`
- Nested element: `data-hk="0.0"`, `data-hk="0.1"`
- Deep nesting: `data-hk="0.0.0"`, `data-hk="0.1.2"`

### Path Semantics

- Zero-based child positions among **emitted element nodes**
- Text nodes do NOT receive markers and do NOT affect path assignment
- Fragment children share the parent sibling counter (flattened)
- Void elements (`<br>`, `<img>`, `<input>`) receive markers like regular elements

### Shape Matching Rules

1. Tag match: DOM tag must match vnode type (e.g., `<div>` vs `"div"`)
2. Marker match: `data-hk` path must match expected tree position
3. Structure match: children must align positionally

### Mismatch Categories

- `tag-mismatch`: Element tag differs (e.g., `<div>` found but `<span>` expected)
- `marker-mismatch`: Hydration marker path doesn't match expected position
- `type-mismatch`: Node type differs (e.g., text expected but element found)
- `missing-child`: Vnode has child but DOM has no corresponding node
- `extra-child`: DOM has extra element node not present in vnode tree
- `extra-text`: DOM has extra text node not present in vnode tree

### Replacement Policy

- Aggressive replacement on structural mismatch
- Text/attribute drift is patched in place when shape matches
- Smallest practical subtree is replaced (not entire tree)
- Recovery is NOT attempted within mismatched subtrees

### Fragment Handling

Fragments are flattened during SSR emission. Fragment children continue the parent's sibling counter. No markers are emitted for fragment wrappers.

**Example:** Fragment: `[child1, child2]` inside `<div>`
SSR output: `<div data-hk="0">child1contentchild2content</div>`
(No markers on text nodes; child positions are implicit)

### Post-Hydration State

After successful hydration:

- All vnodes have `dom` references attached via `setDomRef()`
- Event handlers are rebound (not re-created)
- Extra DOM nodes are removed during hydration
- Tree is ready for patch-based updates via `@ggpwnkthx/dom-runtime`

## Usage

```typescript
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";

const mismatches: MismatchInfo[] = [];
hydrate(vnode, container, { onMismatch: (m) => mismatches.push(m) });
```

## Dependencies

- `@ggpwnkthx/dom-runtime` — DOM operations (createDom, setProp, setEventHandler)
- `@ggpwnkthx/dom-shared` — shared types, errors, and hydration path utilities
- `@ggpwnkthx/jsx` — VNode types (text, element, fragment, component)
