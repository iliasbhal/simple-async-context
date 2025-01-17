import { PromiseWithContext } from "./PromiseWithContext";
import { timers } from './TimersWithContext';

export class Polyfill {
  static enabled = false;
  static ensureEnabled() {
    if (Polyfill.enabled) return;
    Polyfill.enabled = true;

    const root = (typeof global !== 'undefined' && global) ||
      (typeof window !== 'undefined' && window)

    root.Promise = PromiseWithContext as any;

    Object.keys(timers).forEach((key) => {
      root[key] = timers[key];
    });
  }
}