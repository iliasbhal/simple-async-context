import { AsyncContext } from "../lib/AsyncContext";

type AnyFunction = (...args: any) => any;

export const createCallbackWithContext = (originalCallback: AnyFunction) => {
  return (callback: AnyFunction, ...args: any[]) => {
    const fork = AsyncContext.fork()
    const resolver = fork.createResolver(callback);
    const result = originalCallback(resolver, ...args);
    fork.reset();
    return result
  }
}