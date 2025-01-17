import { AsyncContext } from "./AsyncContext";

const OriginalPromise = Promise;

export const PromiseWithContext = function (callback) {
  const originalPromise = new OriginalPromise((resolve, reject) => {
    const fork = AsyncContext.fork()
    const wrapResolve = fork.createResolver(resolve);
    const wrapReject = fork.createResolver(reject);
    callback(wrapResolve, wrapReject);
    fork.reset();
  });


  this.then = function (callback) {
    const fork2 = AsyncContext.fork()
    return originalPromise.then(
      fork2.createResolver(callback)
    )
  }

  this.catch = function (callback) {
    const fork2 = AsyncContext.fork()
    return originalPromise.catch(
      fork2.createResolver(callback)
    )
  }

  this.finally = function (callback) {
    const fork2 = AsyncContext.fork()
    return originalPromise.finally(
      fork2.createResolver(callback)
    )
  }
};

// Ensure that all methods of the original Promise 
// are available on the new PromiseWithContext
Object.getOwnPropertyNames(Promise).forEach((method) => {
  if (typeof Promise[method] === 'function') {
    PromiseWithContext[method] = OriginalPromise[method].bind(PromiseWithContext);
  }
})