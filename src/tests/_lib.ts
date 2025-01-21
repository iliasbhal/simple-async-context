
import { AsyncContext } from '../lib/AsyncContext';
import { Polyfill } from '../polyfills';

export const wait = (timeout: number) => new Promise((resolve) => Polyfill.originalSetTimeout(resolve, timeout))

export const captureAsyncContexts = () => {
  const stackTrace: Set<AsyncContext> = new Set();

  let lastStack = AsyncContext.getCurrent();
  while (lastStack) {
    stackTrace.add(lastStack);
    lastStack = lastStack.origin;
  }

  return Array.from(stackTrace);
}

export const createRecursive = (config: { deepness: number, async: boolean, callback: Function }) => {
  const recursiveAsync = async (steps: number = config.deepness) => {
    if (steps === 1) return config.callback()
    await wait(10)
    return await recursiveAsync(steps - 1);
  };

  const recursiveSync = (steps: number = config.deepness) => {
    if (steps === 0) return config.callback()
    wait(10) // Just a promise but no `await`
    return recursiveSync(steps - 1);
  }

  if (config.async) {
    return recursiveAsync
  }

  return recursiveSync;
}

export const createAsyncDebugger = (debugId: string) => {
  const getDebugStackTrace = (debugId) => {
    const stack = captureAsyncContexts().reverse();
    stack.forEach((ctx: any, i) => {

      const isAlreadyMarked = ctx.index !== undefined;
      if (!isAlreadyMarked) {
        ctx.index = i
        ctx.debugId = debugId;
      };
    })

    return stack.map((ctx: any, i) => {
      return `${ctx.index}/${ctx.debugId}`;
    });
  }

  const root = getDebugStackTrace(debugId);
  return {
    debug(debugId: string) {
      const stackIds = getDebugStackTrace(debugId);
      console.log(debugId, stackIds);
    },
  }
}