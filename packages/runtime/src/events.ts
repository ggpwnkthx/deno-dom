/**
 * @ggpwnkthx/dom-runtime - Event handling primitives.
 * @module
 */

import { InvariantError } from "@ggpwnkthx/dom-shared";

const EVENT_PREFIX = "on";
const EVENT_PREFIX_LENGTH = 2;

export function isEventProp(name: string): boolean {
  return name.startsWith(EVENT_PREFIX) && name.length > EVENT_PREFIX_LENGTH;
}

export function normalizeEventName(propName: string): string {
  return propName.slice(EVENT_PREFIX_LENGTH).toLowerCase();
}

export function assertIsNotEventProp(name: string): void {
  if (isEventProp(name)) {
    throw new InvariantError(
      `Cannot use setProp/removeProp on event prop "${name}". Use setEventHandler instead.`,
    );
  }
}

type EventListener = (...args: unknown[]) => void;

export function addEventListener(
  el: Element,
  propName: string,
  handler: EventListener,
): void {
  const eventName = normalizeEventName(propName);
  el.addEventListener(eventName, handler);
}

export function removeEventListener(
  el: Element,
  propName: string,
  handler: EventListener,
): void {
  const eventName = normalizeEventName(propName);
  el.removeEventListener(eventName, handler);
}

export function setEventHandler(
  el: Element,
  propName: string,
  handler: EventListener | null,
  oldHandler?: EventListener | null,
): void {
  if (typeof oldHandler === "function") {
    removeEventListener(el, propName, oldHandler);
  }
  if (typeof handler === "function") {
    addEventListener(el, propName, handler);
  }
}
