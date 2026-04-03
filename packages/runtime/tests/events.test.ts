import { assertEquals } from "@std/assert";
import {
  addEventListener,
  isEventProp,
  normalizeEventName,
  removeEventListener,
  setEventHandler,
} from "../src/events.ts";

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

Deno.test("addEventListener binds event handler", () => {
  const el = document.createElement("button");
  let called = false;
  addEventListener(el, "onClick", () => {
    called = true;
  });
  el.click();
  assertEquals(called, true);
});

Deno.test("removeEventListener removes event handler", () => {
  const el = document.createElement("button");
  let callCount = 0;
  const handler = () => {
    callCount++;
  };
  addEventListener(el, "onClick", handler);
  el.click();
  assertEquals(callCount, 1);
  removeEventListener(el, "onClick", handler);
  el.click();
  assertEquals(callCount, 1);
});

Deno.test("setEventHandler updates handler", () => {
  const el = document.createElement("button");
  let handler1Count = 0;
  let handler2Count = 0;
  const handler1 = () => handler1Count++;
  const handler2 = () => handler2Count++;
  setEventHandler(el, "onClick", handler1);
  el.click();
  assertEquals(handler1Count, 1);
  assertEquals(handler2Count, 0);
  setEventHandler(el, "onClick", handler2, handler1);
  el.click();
  assertEquals(handler1Count, 1);
  assertEquals(handler2Count, 1);
});

Deno.test("setEventHandler removes old handler when new is null", () => {
  const el = document.createElement("button");
  let callCount = 0;
  const handler = () => callCount++;
  setEventHandler(el, "onClick", handler);
  el.click();
  assertEquals(callCount, 1);
  setEventHandler(el, "onClick", null, handler);
  el.click();
  assertEquals(callCount, 1);
});
