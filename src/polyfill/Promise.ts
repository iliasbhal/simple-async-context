import { AsyncStack } from "./AsyncStack";
import { createAsyncResolver, withContext } from "./_lib";

export const OriginalPromise = Promise;

export const PromiseWithContext = function (callback) {
  return new OriginalPromise((resolve, reject) => {
    const fork = AsyncStack.fork();
    const wrapResolve = createAsyncResolver(fork, resolve);
    const wrapReject = createAsyncResolver(fork, reject);
    callback(wrapResolve, wrapReject);
    fork.yield();
  });
};

OriginalPromise.prototype.then = withContext(OriginalPromise.prototype.then);
OriginalPromise.prototype.catch = withContext(OriginalPromise.prototype.catch);
OriginalPromise.prototype.finally = withContext(
  OriginalPromise.prototype.finally,
);

// Ensure that all methods of the original Promise
// are available on the new PromiseWithContext
Object.getOwnPropertyNames(Promise).forEach((method) => {
  if (typeof Promise[method] === "function") {
    PromiseWithContext[method] =
      OriginalPromise[method].bind(PromiseWithContext);
  }
});
