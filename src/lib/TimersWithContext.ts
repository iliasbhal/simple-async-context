import { AsyncContext } from "./AsyncContext";

const orignalSetTimeout = setTimeout;
export const setTimeoutWithContext = function (callback, timeout) {
  const fork = AsyncContext.fork()
  const resolver = fork.createResolver(callback);
  const result = orignalSetTimeout(resolver, timeout);
  fork.reset();
  return result
};


const orignalSetInterval = setTimeout;
export const setIntervalWithContext = function (callback, interval) {
  const fork = AsyncContext.fork()
  const resolver = fork.createResolver(callback);
  const result = orignalSetInterval(resolver, interval);
  fork.reset();
  return result
};
