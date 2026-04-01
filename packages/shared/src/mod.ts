/**
 * @ggpwnkthx/dom-shared - Shared types, errors, and validation helpers.
 * @module
 */

export class NotImplementedError extends Error {
  constructor(api: string) {
    super(`@ggpwnkthx/dom-shared: ${api} is not implemented yet`);
    this.name = "NotImplementedError";
  }
}
