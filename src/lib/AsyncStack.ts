export class AsyncStack {
  static Global = new AsyncStack(null);
  private static current: AsyncStack = null

  static getCurrent(): AsyncStack {
    const current = this.current;
    return current;
  }

  protected static set(ctx: AsyncStack) {
    this.current = ctx;
  }

  static fork() {
    const origin = AsyncStack.getCurrent();
    const fork = new AsyncStack(origin);
    fork.start();
    return fork
  }

  origin?: AsyncStack;

  constructor(origin: AsyncStack | null) {
    this.origin = origin || AsyncStack.Global;
  }

  start() {
    AsyncStack.set(this);
  }

  yield() {
    AsyncStack.set(this.origin);
  }

  createResolver(callback) {
    let executed = false;
    return (...args: any[]) => {
      if (executed) return;
      executed = true;

      this.yield();

      // Note: Is this fork neecessary? All tests are passing without it.
      // const fork = AsyncContext.fork()
      const result = callback(...args);
      // fork.reset();
      return result;
    }
  }
}

