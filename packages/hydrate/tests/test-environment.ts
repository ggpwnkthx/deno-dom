import { DOMParser, Node } from "@b-fuze/deno-dom";

class TestEnvironment {
  private static initialized = false;

  static init(): void {
    if (this.initialized) return;
    this.initialized = true;
    const doc = new DOMParser().parseFromString(
      "<html><body></body></html>",
      "text/html",
    );
    // deno-lint-ignore no-explicit-any
    (globalThis as any).Node = Node;
    // deno-lint-ignore no-explicit-any
    (globalThis as any).document = doc;
  }

  createSSRContainer(innerHTML: string): HTMLDivElement {
    TestEnvironment.init();
    const doc = new DOMParser().parseFromString(
      `<body><div>${innerHTML}</div></body>`,
      "text/html",
    );
    const firstChild = doc.body.firstChild;
    if (!firstChild) {
      throw new Error("Failed to parse HTML: body.firstChild is null");
    }
    // @ts-expect-error - HTML structure guarantees firstChild is a div element
    return firstChild;
  }
}

export const env = new TestEnvironment();
