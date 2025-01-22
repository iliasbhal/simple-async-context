const GlobalSymbol = Symbol("Global");

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

  static NO_DATA = Symbol("NO_DATA");

  static fork() {
    const origin = AsyncStack.getCurrent();
    const fork = new AsyncStack(origin);
    fork.start();
    return fork;
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

  // private yielded = false
  yield() {
    // if (!this.yielded) return;
    // this.yielded = true;
    AsyncStack.set(this.origin);
  }
}
