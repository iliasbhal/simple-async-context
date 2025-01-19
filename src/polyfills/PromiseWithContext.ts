import { AsyncContext } from "../lib/AsyncContext";
import { createHofWithContext } from './createHofWithContext';

const OriginalPromise = Promise;

export const PromiseWithContext = function (callback) {
  return new OriginalPromise((resolve, reject) => {
    const fork = AsyncContext.fork()
    const wrapResolve = fork.createResolver(resolve);
    const wrapReject = fork.createResolver(reject);
    callback(wrapResolve, wrapReject);
    fork.reset();
  });


};

OriginalPromise.prototype.then = createHofWithContext(OriginalPromise.prototype.then)
OriginalPromise.prototype.catch = createHofWithContext(OriginalPromise.prototype.catch)
OriginalPromise.prototype.finally = createHofWithContext(OriginalPromise.prototype.finally)

// Ensure that all methods of the original Promise 
// are available on the new PromiseWithContext
Object.getOwnPropertyNames(Promise).forEach((method) => {
  if (typeof Promise[method] === 'function') {
    PromiseWithContext[method] = OriginalPromise[method].bind(PromiseWithContext);
  }
})