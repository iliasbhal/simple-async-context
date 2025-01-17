import { AsyncContext } from "../lib/AsyncContext";
import { createCallbackWithContext } from './createCallbackWithContext';

const OriginalPromise = Promise;

export const PromiseWithContext = function (callback) {
  const originalPromise = new OriginalPromise((resolve, reject) => {
    const fork = AsyncContext.fork()
    const wrapResolve = fork.createResolver(resolve);
    const wrapReject = fork.createResolver(reject);
    callback(wrapResolve, wrapReject);
    fork.reset();
  });


  this.then = createCallbackWithContext(originalPromise.then.bind(originalPromise))
  this.catch = createCallbackWithContext(originalPromise.catch.bind(originalPromise))
  this.finally = createCallbackWithContext(originalPromise.finally.bind(originalPromise))
};

// Ensure that all methods of the original Promise 
// are available on the new PromiseWithContext
Object.getOwnPropertyNames(Promise).forEach((method) => {
  if (typeof Promise[method] === 'function') {
    PromiseWithContext[method] = OriginalPromise[method].bind(PromiseWithContext);
  }
})