import { AsyncContext } from "./AsyncContext";

type AnyFunction = (...args: any) => any;

const createTimerPolyfill = (originalTimer: AnyFunction) => {
  return (callback: AnyFunction, ...args) => {
    const fork = AsyncContext.fork()
    const resolver = fork.createResolver(callback);
    const result = originalTimer(resolver, ...args);
    fork.reset();
    return result
  }
}

export const timers = {
  setTimeout: createTimerPolyfill(setTimeout),
  setInterval: createTimerPolyfill(setInterval),
  setImmediate: createTimerPolyfill(setImmediate),
};
