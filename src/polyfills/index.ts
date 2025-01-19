import { PromiseWithContext } from "./PromiseWithContext";
import { createHofWithContext } from "./createHofWithContext";

export class Polyfill {
  static originalSetTimeout = setTimeout;

  static enabled = false;
  static ensureEnabled() {
    if (Polyfill.enabled) return;
    Polyfill.enabled = true;

    const root = (typeof global !== 'undefined' && global) ||
      (typeof window !== 'undefined' && window)

    // Polyfill Promise
    root.Promise = PromiseWithContext as any;

    // Polyfill Timers
    root.setTimeout = createHofWithContext(root.setTimeout);
    root.setInterval = createHofWithContext(root.setInterval);
    root.setImmediate = createHofWithContext(root.setImmediate);
  }
}