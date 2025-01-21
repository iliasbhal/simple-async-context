import { OriginalPromise, PromiseWithContext, } from "./PromiseWithContext";
import { createHofWithContext } from "./createHofWithContext";

const root = (typeof global !== 'undefined' && global) ||
  (typeof window !== 'undefined' && window)

export class Polyfill {
  static originalSetTimeout = setTimeout;
  static OriginalPromise = OriginalPromise;

  static enabled = false;
  static ensureEnabled() {
    if (Polyfill.enabled) return;
    Polyfill.enabled = true;

    // Polyfill Promise
    root.Promise = PromiseWithContext as any;

    // Polyfill Timers
    root.setTimeout = createHofWithContext(root.setTimeout);
    root.setInterval = createHofWithContext(root.setInterval);
    root.setImmediate = createHofWithContext(root.setImmediate);
  }
}