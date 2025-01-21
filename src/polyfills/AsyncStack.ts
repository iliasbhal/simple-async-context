const GlobalSymbol = Symbol('Global');

export class AsyncStack {
  // @ts-expect-error
  static Global = new AsyncStack(GlobalSymbol);
  private static current: AsyncStack = AsyncStack.Global;

  static getCurrent(): AsyncStack {
    const current = this.current;
    return current;
  }

  protected static set(ctx: AsyncStack) {
    this.current = ctx;
  }

  static NO_DATA = Symbol('NO_DATA');

  static fork() {
    const origin = AsyncStack.getCurrent();
    const fork = new AsyncStack(origin);
    fork.start();
    return fork
  }

  origin?: AsyncStack;

  constructor(origin?: AsyncStack) {
    // @ts-expect-error
    if (origin !== GlobalSymbol) {
      this.origin = origin;
    }
  }

  start() {
    AsyncStack.set(this);
  }

  yield() {
    AsyncStack.set(this.origin);
  }

  createResolver(callback) {
    let triggered = false;

    return (...args: any[]) => {
      if (triggered) return;
      triggered = true;


      this.yield();
      // Note: Is this fork neecessary? All tests are passing without it.
      // const fork = AsyncContext.fork()
      const result = callback(...args);
      // fork.reset();
      return result;
    }
  }
}

