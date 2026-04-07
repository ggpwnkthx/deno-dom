# @ggpwnkthx/dom-runtime

Client DOM mount and patch behavior for `@ggpwnkthx/jsx` vnodes.

## Status

**Implemented** — client-side DOM creation, mounting, prop application, event binding, and patching.

## Public API

```typescript
import { mount, patch } from "jsr:@ggpwnkthx/dom-runtime";
import type { VNode } from "jsr:@ggpwnkthx/dom-runtime";
```

## Usage

```typescript
import { mount, patch } from "jsr:@ggpwnkthx/dom-runtime";
import type { VNode } from "jsr:@ggpwnkthx/dom-runtime";

// Mount a vnode tree to the DOM
const vnode: VNode = {
  type: "div",
  props: { class: "container", id: "app" },
  children: [
    { type: "h1", props: {}, children: "Hello World" },
    {
      type: "button",
      props: { onClick: () => console.log("clicked") },
      children: "Click me",
    },
  ],
};

mount(vnode, document.body);

// Patch an existing vnode with updates
const newVNode: VNode = {
  type: "div",
  props: { class: "container updated", id: "app" },
  children: [
    { type: "h1", props: {}, children: "Hello Updated World" },
    {
      type: "button",
      props: { onClick: () => console.log("clicked") },
      children: "Click me",
    },
  ],
};

const updatedDom = patch(
  vnode,
  newVNode,
  document.getElementById("app")!,
  document.body,
);
```

## Features

- Mount from canonical `VNode` trees produced by `@ggpwnkthx/jsx`
- Patch incremental DOM updates (text, props, children, event handlers)
- WeakMap-based DOM reference strategy — does not mutate upstream vnode objects
- Depth guards to prevent stack overflow on deep vnode trees
- `aria-*`, `id`, `class`, `data-*`, `value`, `checked`, `selected`, `style` prop handling

## Note

This package focuses on client DOM behavior only. SSR hydration belongs in `@ggpwnkthx/dom-hydrate`.
