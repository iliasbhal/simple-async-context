import { PromiseWithContext } from "./PromiseWithContext";
import { setIntervalWithContext, setTimeoutWithContext } from './TimersWithContext';

export class Polyfill {
  static enabled = false;
  static ensureEnabled() {
    if (Polyfill.enabled) return;
    Polyfill.enabled = true;

    const root = (typeof global !== 'undefined' && global) ||
      (typeof window !== 'undefined' && window)

    root.Promise = PromiseWithContext as any;
    root.setTimeout = setTimeoutWithContext as any;
    root.setInterval = setIntervalWithContext as any
  }
}

Polyfill.ensureEnabled();