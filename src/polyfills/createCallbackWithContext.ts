import { AsyncContext } from "../lib/AsyncContext";

type AnyFunction = (...args: any) => any;

export const createCallbackWithContext = (originalCallback: AnyFunction) => {
  return (callback: AnyFunction) => {
    const fork = AsyncContext.fork()
    const resolver = fork.createResolver(callback);
    const result = originalCallback(resolver);
    fork.reset();
    return result
  }
}