import { DOMParser, Node } from "@b-fuze/deno-dom";

type GlobalDocument = typeof globalThis.document;
type GlobalNode = typeof globalThis.Node;

class DomTestEnvironment {
  private static initialized = false;

  static init(): void {
    if (this.initialized) return;
    this.initialized = true;
  }

  private static installGlobals(): void {
    const doc = new DOMParser().parseFromString(
      "<html><body></body></html>",
      "text/html",
    );
    const nodeInstance = Node as unknown as GlobalNode;
    const docInstance = doc as unknown as GlobalDocument;
    globalThis.Node = nodeInstance;
    globalThis.document = docInstance;
  }

  createContainer(innerHTML = ""): HTMLDivElement {
    if (!DomTestEnvironment.initialized) {
      DomTestEnvironment.installGlobals();
      DomTestEnvironment.init();
    }
    const doc = new DOMParser().parseFromString(
      `<body><div>${innerHTML}</div></body>`,
      "text/html",
    );
    const firstChild = doc.body.firstChild;
    if (!firstChild) {
      throw new Error("Failed to parse HTML: body.firstChild is null");
    }
    return firstChild as unknown as HTMLDivElement;
  }
}

export const env = new DomTestEnvironment();
export const initDomEnvironment = DomTestEnvironment.init;
