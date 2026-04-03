# @ggpwnkthx/dom-runtime

Client DOM mount and patch behavior for `@ggpwnkthx/jsx` vnodes.

## Status

**Implemented** — client-side DOM creation, mounting, prop application, event binding, and patching.

## Public API

```ts
import { mount, patch } from "jsr:@ggpwnkthx/dom-runtime@0.0.1-rc.8";
import type { VNode } from "jsr:@ggpwnkthx/dom-runtime@0.0.1-rc.8";

mount(vnode: VNode, container: ParentNode): void;
patch(oldVNode: VNode, newVNode: VNode, domNode: Node, parentDom: ParentNode): Node;
```

## Features

- Mount from canonical `VNode` trees produced by `@ggpwnkthx/jsx`
- Patch incremental DOM updates (text, props, children, event handlers)
- WeakMap-based DOM reference strategy — does not mutate upstream vnode objects
- Depth guards to prevent stack overflow on deep vnode trees
- `aria-*`, `id`, `class`, `data-*`, `value`, `checked`, `selected`, `style` prop handling

## Note

This package focuses on client DOM behavior only. SSR hydration belongs in `@ggpwnkthx/dom-hydrate`.
