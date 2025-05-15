import { AsyncContext } from "../lib/AsyncStack";

type AnyFunction = (...args: any) => any;

// This function ensure that the context is passed to the callback
// That is called by the higher order function
export const createHofWithContext = <Callback extends AnyFunction | undefined>(originalCallback: Callback): Callback => {
  if (typeof originalCallback === "undefined") return undefined

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