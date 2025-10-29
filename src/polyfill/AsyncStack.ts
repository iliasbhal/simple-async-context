const GlobalSymbol = Symbol("Global");

let stackId = 0;

export class AsyncStack {
  public id = stackId++;

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
    const stack = new AsyncStack(origin);
    stack.start();
    return stack;
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
}
