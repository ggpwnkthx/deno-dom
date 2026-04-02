/**
 * @ggpwnkthx/dom-runtime - Event handling primitives.
 * @module
 */

const EVENT_PREFIX = "on";
const EVENT_PREFIX_LENGTH = 2;

export function isEventProp(name: string): boolean {
  return name.startsWith(EVENT_PREFIX) && name.length > EVENT_PREFIX_LENGTH;
}

export function normalizeEventName(propName: string): string {
  return propName.slice(EVENT_PREFIX_LENGTH).toLowerCase();
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
  if (oldHandler) {
    removeEventListener(el, propName, oldHandler as EventListener);
  }
  if (handler) {
    addEventListener(el, propName, handler);
  }
}
