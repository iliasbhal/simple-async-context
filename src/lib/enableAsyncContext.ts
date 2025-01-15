import { SimpleAsyncContext } from './SimpleAsyncContext';

export const enableAsyncContext = () => {
  const OriginalPromise = Promise;
  const PromiseWithContext = function (callback) {
    const fork = SimpleAsyncContext.fork()

    const originalPromise = new OriginalPromise<any>((resolve, reject) => {
      const wrapResolve = fork.createResolver(resolve);
      const wrapReject = fork.createResolver(reject);
      callback(wrapResolve, wrapReject);
      fork.reset();
    });


    this.then = function (callback) {
      const fork2 = SimpleAsyncContext.fork()
      return originalPromise.then(
        fork2.createResolver(callback)
      )
    }

    this.catch = function (callback) {
      const fork2 = SimpleAsyncContext.fork()
      return originalPromise.catch(
        fork2.createResolver(callback)
      )
    }

    this.finally = function (callback) {
      const fork2 = SimpleAsyncContext.fork()
      return originalPromise.finally(
        fork2.createResolver(callback)
      )
    }
  };


  const root = (typeof global !== 'undefined' && global) ||
    (typeof window !== 'undefined' && window)

  // @ts-ignore
  root.Promise = PromiseWithContext;
  PromiseWithContext.resolve = OriginalPromise.resolve.bind(PromiseWithContext);
  PromiseWithContext.reject = OriginalPromise.reject.bind(PromiseWithContext);
  PromiseWithContext.all = OriginalPromise.all.bind(PromiseWithContext);
  PromiseWithContext.allSettled = OriginalPromise.allSettled.bind(PromiseWithContext);
  PromiseWithContext.any = OriginalPromise.any.bind(PromiseWithContext);
  PromiseWithContext.race = OriginalPromise.race.bind(PromiseWithContext);
}