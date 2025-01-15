export class SimpleAsyncContext {
  private static current: Context = null

  static getCurrent() {
    return this.current;
  }

  static getData() {
    let current = SimpleAsyncContext.getCurrent();

    while (true) {
      if (current?.data) {
        return current.data;
      }

      if (!current) break;
      current = current?.parent;
    }
  }



  static set(ctx: Context) {
    this.current = ctx;
  }

  static withData(data: any) {
    return {
      run(callback: Function) {
        return SimpleAsyncContext.runWithData(data, callback);
      },
      wrap(callback: Function) {
        return SimpleAsyncContext.wrapWithData(data, callback);
      },
      fork() {
        return SimpleAsyncContext.forkWithData(data);
      }
    }
  }

  static fork() {
    return SimpleAsyncContext.forkWithData(null);
  }

  static run(callback: Function) {
    return SimpleAsyncContext.runWithData(null, callback);
  }

  static wrap(callback: Function) {
    return SimpleAsyncContext.wrapWithData(null, callback);
  }

  private static forkWithData(data: any) {
    const parent = SimpleAsyncContext.getCurrent();
    const fork = new Context(parent);
    fork.setData(data);
    fork.start();
    return fork
  }

  private static wrapWithData(data: any, callback: Function): Function {
    return (...args) => {
      return SimpleAsyncContext.runWithData(data, () => callback(...args));
    }
  }

  private static runWithData(data: any, callback: Function): Function {
    const asyncfork = this.forkWithData(data);
    const result = callback();
    asyncfork.reset();
    return result;
  }
}

export class Context {

  parent: Context;
  data: Record<string, any> = null;

  constructor(parent: Context) {
    // this.data = data;
    this.parent = parent;
  }

  setData(data: Record<string, any>) {
    this.data = data;
  }

  start() {
    SimpleAsyncContext.set(this);
  }

  reset() {
    SimpleAsyncContext.set(this.parent);
  }

  createResolver(callback) {
    return (...args: any[]) => {
      this.reset();

      const fork = SimpleAsyncContext.fork()
      const result = callback(...args);
      fork.reset();
      return result;
    }
  }
}