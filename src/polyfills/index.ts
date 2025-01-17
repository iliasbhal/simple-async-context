import { PromiseWithContext } from "./PromiseWithContext";
import { timers } from './TimersWithContext';
import { addEventListenerWithContext } from './EventWithContext'

export class Polyfill {
  static enabled = false;
  static ensureEnabled() {
    if (Polyfill.enabled) return;
    Polyfill.enabled = true;

    const root = (typeof global !== 'undefined' && global) ||
      (typeof window !== 'undefined' && window)

    // Polyfill Promise
    root.Promise = PromiseWithContext as any;

    // Polyfill Timers
    Object.keys(timers).forEach((key) => {
      root[key] = timers[key];
    });

    // Polyfill EventListeners
    EventTarget.prototype.addEventListener = addEventListenerWithContext;
  }
}