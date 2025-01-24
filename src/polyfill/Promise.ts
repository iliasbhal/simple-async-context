import { AsyncStack } from "./AsyncStack";
import { createAsyncResolver, callWithContext } from "./_lib";

export const OriginalPromise = Promise;

export class PromiseWithContext<T> extends OriginalPromise<T> {
  constructor(callback: any) {
    super((resolve, reject) => {
      const fork = AsyncStack.fork();
      const wrapResolve = createAsyncResolver(fork, resolve);
      const wrapReject = createAsyncResolver(fork, reject);
      callback(wrapResolve, wrapReject);
      fork.yield();
    })
  }

  then<T, B>(...args: any[]) {
    return callWithContext.call(this, super.then, args)
  }

  catch<T, B>(...args: any[]) {
    return callWithContext.call(this, super.catch, args)
  }

  finally<T, B>(...args: any[]) {
    return callWithContext.call(this, super.finally, args)
  }
}

// Ensure that all methods of the original Promise
// are available on the new PromiseWithContext
Object.getOwnPropertyNames(Promise).forEach((method) => {
  if (typeof Promise[method] === "function") {
    PromiseWithContext[method] =
      OriginalPromise[method].bind(PromiseWithContext);
  }
});
