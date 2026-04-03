import { assertEquals } from "@std/assert";

Deno.test("smoke: root facade imports without resolution failure", async () => {
  const mod = await import("../src/mod.ts");
  assertEquals(typeof mod, "object");
});

Deno.test("smoke: package exports are reachable", async () => {
  const shared = await import("../packages/shared/src/mod.ts");
  const runtime = await import("../packages/runtime/src/mod.ts");
  const hydrate = await import("../packages/hydrate/src/mod.ts");
  const scheduler = await import("../packages/scheduler/src/mod.ts");

  assertEquals(typeof shared, "object");
  assertEquals(typeof runtime, "object");
  assertEquals(typeof hydrate, "object");
  assertEquals(typeof scheduler, "object");
});
