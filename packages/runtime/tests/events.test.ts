import { assertEquals, assertThrows } from "@std/assert";
import {
  addEventListener,
  assertIsNotEventProp,
  isEventProp,
  normalizeEventName,
  removeEventListener,
  setEventHandler,
} from "../src/events.ts";
import { InvariantError } from "@ggpwnkthx/dom-shared";
import { env } from "../../../tests/dom-test-environment.ts";

env.createContainer(); // Initialize DOM globals

Deno.test("isEventProp returns true for onClick", () => {
  assertEquals(isEventProp("onClick"), true);
});

Deno.test("isEventProp returns true for onInput", () => {
  assertEquals(isEventProp("onInput"), true);
});

Deno.test("isEventProp returns false for regular prop", () => {
  assertEquals(isEventProp("class"), false);
});

Deno.test("isEventProp returns false for 'on' alone", () => {
  assertEquals(isEventProp("on"), false);
});

Deno.test("normalizeEventName converts onClick to click", () => {
  assertEquals(normalizeEventName("onClick"), "click");
});

Deno.test("normalizeEventName converts onInput to input", () => {
  assertEquals(normalizeEventName("onInput"), "input");
});

Deno.test("normalizeEventName converts onChange to change", () => {
  assertEquals(normalizeEventName("onChange"), "change");
});

Deno.test("assertIsNotEventProp throws for event prop", () => {
  assertThrows(
    () => assertIsNotEventProp("onClick"),
    InvariantError,
    'Cannot use setProp/removeProp on event prop "onClick"',
  );
});

Deno.test("assertIsNotEventProp throws for onMouseOver", () => {
  assertThrows(
    () => assertIsNotEventProp("onMouseOver"),
    InvariantError,
    'Cannot use setProp/removeProp on event prop "onMouseOver"',
  );
});

Deno.test("assertIsNotEventProp does not throw for regular prop", () => {
  assertIsNotEventProp("class");
  assertIsNotEventProp("id");
  assertIsNotEventProp("data-value");
});

Deno.test("addEventListener binds event handler", () => {
  const el = document.createElement("button");
  let called = false;
  addEventListener(el, "onClick", () => {
    called = true;
  });
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(called, true);
});

Deno.test("removeEventListener removes event handler", () => {
  const el = document.createElement("button");
  let callCount = 0;
  const handler = () => {
    callCount++;
  };
  addEventListener(el, "onClick", handler);
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(callCount, 1);
  removeEventListener(el, "onClick", handler);
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(callCount, 1);
});

Deno.test("setEventHandler updates handler", () => {
  const el = document.createElement("button");
  let handler1Count = 0;
  let handler2Count = 0;
  const handler1 = () => handler1Count++;
  const handler2 = () => handler2Count++;
  setEventHandler(el, "onClick", handler1);
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(handler1Count, 1);
  assertEquals(handler2Count, 0);
  setEventHandler(el, "onClick", handler2, handler1);
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(handler1Count, 1);
  assertEquals(handler2Count, 1);
});

Deno.test("setEventHandler removes old handler when new is null", () => {
  const el = document.createElement("button");
  let callCount = 0;
  const handler = () => callCount++;
  setEventHandler(el, "onClick", handler);
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(callCount, 1);
  setEventHandler(el, "onClick", null, handler);
  el.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(callCount, 1);
});
