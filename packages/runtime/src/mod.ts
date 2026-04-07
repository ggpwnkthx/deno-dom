/**
 * Client DOM mount and patch behavior.
 * Provides functions for mounting VNode trees to the DOM and patching existing DOM nodes.
 * @module
 */

export { mount } from "./mount.ts";
export { patch } from "./patch/mod.ts";
export { createDom, removeProp, replaceNode, setProp, setText } from "./dom/mod.ts";
export { getDomRef, removeDomRef, setDomRef } from "./types.ts";
export { isEventProp, setEventHandler } from "./events.ts";
