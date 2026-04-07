/**
 * Client DOM mount and patch behavior.
 * Provides functions for mounting VNode trees to the DOM and patching existing DOM nodes.
 *
 * @module
 *
 * @example
 * ```typescript
 * import { mount, patch } from "@ggpwnkthx/dom-runtime";
 * import type { VNode } from "@ggpwnkthx/dom-runtime";
 *
 * // Mount a vnode tree to the DOM
 * const vnode: VNode = {
 *   type: "div",
 *   props: { class: "container" },
 *   children: [{ type: "h1", props: {}, children: "Hello World" }],
 * };
 *
 * mount(vnode, document.body);
 *
 * // Patch an existing vnode with updates
 * const newVNode: VNode = {
 *   type: "div",
 *   props: { class: "container updated" },
 *   children: [{ type: "h1", props: {}, children: "Hello Updated" }],
 * };
 *
 * const updatedDom = patch(vnode, newVNode, document.getElementById("app")!, document.body);
 * ```
 */

export { mount } from "./mount.ts";
export { patch } from "./patch/mod.ts";
export { createDom, removeProp, replaceNode, setProp, setText } from "./dom/mod.ts";
export { getDomRef, removeDomRef, setDomRef } from "./types.ts";
export { isEventProp, setEventHandler } from "./events.ts";
