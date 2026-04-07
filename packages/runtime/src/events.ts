/**
 * Event handling primitives for attaching and removing DOM event listeners.
 * @module
 */

import { InvariantError } from "@ggpwnkthx/dom-shared";

const EVENT_PREFIX = "on";
const EVENT_PREFIX_LENGTH = 2;

/**
 * Checks if a property name represents an event handler.
 * Event props start with "on" followed by the event name (e.g., "onClick").
 * @param name - The property name to check
 * @returns True if the name represents an event handler property
 */
export function isEventProp(name: string): boolean {
  return name.startsWith(EVENT_PREFIX) && name.length > EVENT_PREFIX_LENGTH;
}

/**
 * Converts an event prop name to a normalized DOM event name.
 * Strips the "on" prefix and lowercases the remaining string.
 * @param propName - The event property name (e.g., "onClick")
 * @returns The normalized event name (e.g., "click")
 */
export function normalizeEventName(propName: string): string {
  return propName.slice(EVENT_PREFIX_LENGTH).toLowerCase();
}

/**
 * Asserts that a property name is NOT an event handler.
 * Use this before setting/removing props to ensure event handlers are not accidentally modified.
 * @param name - The property name to check
 * @throws {InvariantError} If the name is an event prop (starts with "on")
 */
export function assertIsNotEventProp(name: string): void {
  if (isEventProp(name)) {
    throw new InvariantError(
      `Cannot use setProp/removeProp on event prop "${name}". Use setEventHandler instead.`,
    );
  }
}

/**
 * Type alias for event handler functions that can be attached to DOM elements.
 */
type EventListener = (...args: unknown[]) => void;

/**
 * Adds an event listener to an element for the event specified by the prop name.
 * @param el - The element to attach the listener to
 * @param propName - The event property name (e.g., "onClick")
 * @param handler - The event handler function to attach
 */
export function addEventListener(
  el: Element,
  propName: string,
  handler: EventListener,
): void {
  const eventName = normalizeEventName(propName);
  el.addEventListener(eventName, handler);
}

/**
 * Removes an event listener from an element for the event specified by the prop name.
 * @param el - The element to remove the listener from
 * @param propName - The event property name (e.g., "onClick")
 * @param handler - The event handler function to remove
 */
export function removeEventListener(
  el: Element,
  propName: string,
  handler: EventListener,
): void {
  const eventName = normalizeEventName(propName);
  el.removeEventListener(eventName, handler);
}

/**
 * Sets an event handler on an element, optionally removing a previous handler.
 * @param el - The element to set the event handler on
 * @param propName - The event property name (e.g., "onClick")
 * @param handler - The new event handler function, or null to remove
 * @param oldHandler - Optional previous handler to remove before setting the new one
 */
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
