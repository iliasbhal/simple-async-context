import { AsyncStack } from "../lib/AsyncStack";
import { createHofWithContext } from './createHofWithContext';

export const OriginalPromise = Promise;

export const PromiseWithContext = function (callback) {
  const originalPromise = new OriginalPromise((resolve, reject) => {
    const fork = AsyncStack.fork()
    const wrapResolve = fork.createResolver(resolve);
    const wrapReject = fork.createResolver(reject);
    callback(wrapResolve, wrapReject);
    fork.yield();
  });


  this.then = createHofWithContext(originalPromise.then.bind(originalPromise))
  this.catch = createHofWithContext(originalPromise.catch.bind(originalPromise))
  this.finally = createHofWithContext(originalPromise.finally.bind(originalPromise))
};

// Ensure that all methods of the original Promise 
// are available on the new PromiseWithContext
Object.getOwnPropertyNames(Promise).forEach((method) => {
  if (typeof Promise[method] === 'function') {
    PromiseWithContext[method] = OriginalPromise[method].bind(PromiseWithContext);
  }
})