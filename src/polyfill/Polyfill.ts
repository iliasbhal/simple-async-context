import { OriginalPromise, PromiseWithContext } from "./Promise";
import { addEventListenerWithContext, dispatchWithContext } from "./Events";
import { withContext } from "./_lib";

const root =
  (typeof global !== "undefined" && global) ||
  (typeof window !== "undefined" && window);

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
    root.setTimeout = withContext(root.setTimeout);
    root.setInterval = withContext(root.setInterval);
    root.setImmediate = withContext(root.setImmediate);

    EventTarget.prototype.addEventListener = addEventListenerWithContext;
    EventTarget.prototype.dispatchEvent = dispatchWithContext;
  }
}
