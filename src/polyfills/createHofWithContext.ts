import { AsyncContext } from "../lib/AsyncContext";

type AnyFunction = (...args: any) => any;

// This function ensure that the context is passed to the callback
// That is called by the higher order function
export const createHofWithContext = <Callback extends AnyFunction>(originalCallback: Callback): Callback => {
  return function (...args: any[]) {
    const fork = AsyncContext.fork()

    const patchedArgs = args.map((arg) => {
      if (typeof arg === 'function') {
        return fork.createResolver(arg);
      }

      return arg;
    });

    const result = originalCallback.call(this, ...patchedArgs);
    fork.reset();
    return result
  } as any
}