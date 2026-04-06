import { assertEquals } from "@std/assert";
import { createElementVNode, createTextVNode } from "@ggpwnkthx/jsx";
import { hydrate, type MismatchInfo } from "@ggpwnkthx/dom-hydrate";
import { env } from "./test-environment.ts";

function getHydratedParagraph(
  ssrHTML: string,
  paragraphProps: Record<string, unknown> | null,
): {
  container: HTMLDivElement;
  paragraph: HTMLParagraphElement;
  mismatches: MismatchInfo[];
} {
  const container = env.createSSRContainer(ssrHTML);
  const paragraph = createElementVNode(
    "p",
    paragraphProps,
    null,
    [createTextVNode("Content")],
  );
  const vnode = createElementVNode("div", null, null, [paragraph]);
  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });
  const root = container.firstElementChild as HTMLDivElement;
  return {
    container,
    paragraph: root.firstElementChild as HTMLParagraphElement,
    mismatches,
  };
}

Deno.test("hydrate decision: stale SSR attributes are removed during hydration", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0" id="stale-id" data-old="removed">Content</p></div>';
  const { paragraph, mismatches } = getHydratedParagraph(ssrHTML, {
    id: "new-id",
    class: "new-class",
  });

  assertEquals(paragraph.id, "new-id");
  assertEquals(paragraph.className, "new-class");
  assertEquals(paragraph.hasAttribute("data-old"), false);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: data-hk attribute is preserved even though not in vnode props", () => {
  const ssrHTML = '<div data-hk="0"><p data-hk="0.0">Content</p></div>';
  const { paragraph, mismatches } = getHydratedParagraph(ssrHTML, null);

  assertEquals(paragraph.hasAttribute("data-hk"), true);
  assertEquals(paragraph.getAttribute("data-hk"), "0.0");
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: SSR attributes not in vnode props are removed", () => {
  const ssrHTML =
    '<div data-hk="0"><p data-hk="0.0" data-extra="removed" id="stale">Content</p></div>';
  const { paragraph, mismatches } = getHydratedParagraph(ssrHTML, { id: "updated" });

  assertEquals(paragraph.id, "updated");
  assertEquals(paragraph.hasAttribute("data-extra"), false);
  assertEquals(paragraph.hasAttribute("data-hk"), true);
  assertEquals(mismatches.length, 0);
});

Deno.test("hydrate decision: event handlers are bound during hydration", () => {
  const ssrHTML = '<div data-hk="0"><button data-hk="0.0">Click me</button></div>';
  const container = env.createSSRContainer(ssrHTML);

  let clicked = false;
  const button = createElementVNode(
    "button",
    {
      onClick: () => {
        clicked = true;
      },
    },
    null,
    [createTextVNode("Click me")],
  );
  const vnode = createElementVNode("div", null, null, [button]);

  hydrate(vnode, container);

  const root = container.firstElementChild as HTMLDivElement;
  const currentButton = root.firstElementChild as HTMLButtonElement;

  currentButton.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(clicked, true);
});

Deno.test("hydrate decision: event handlers are rebound after node replacement", () => {
  const ssrHTML = '<div data-hk="0"><span data-hk="0.0">Old</span></div>';
  const container = env.createSSRContainer(ssrHTML);

  let clicked = false;
  const button = createElementVNode(
    "button",
    {
      onClick: () => {
        clicked = true;
      },
    },
    null,
    [createTextVNode("New")],
  );
  const vnode = createElementVNode("div", null, null, [button]);

  const mismatches: MismatchInfo[] = [];
  hydrate(vnode, container, { onMismatch: (info) => mismatches.push(info) });

  const root = container.firstElementChild as HTMLDivElement;
  const currentButton = root.firstElementChild as HTMLButtonElement;

  assertEquals(mismatches.some((m) => m.kind === "tag-mismatch"), true);
  assertEquals(currentButton.tagName, "BUTTON");

  currentButton.dispatchEvent(new Event("click", { bubbles: true }));
  assertEquals(clicked, true);
});
