import { Polyfill } from './Polyfill';

type AnyFunction = (...args: any) => any;

class AsyncVariable {
  constructor() {
    Polyfill.ensureEnabled();
  }

  get() {
    return AsyncContext.getVariableData(this);
  }

  run<Fn extends AnyFunction>(value: any, callback: Fn) {
    return AsyncContext.runWithData(this, value, callback);
  }

  withData(data: any) {
    const self = this;
    return {
      run<Fn extends AnyFunction>(callback: Fn) {
        return AsyncContext.runWithData(self, data, callback);
      },
      wrap<Fn extends AnyFunction>(callback: Fn) {
        return AsyncContext.wrapWithData(self, data, callback);
      },
      fork() {
        return AsyncContext.forkWithData(self, data);
      }
    }
  }
}

class AsyncSnapshot {
  run<Fn extends AnyFunction>(callback: Fn) {
    // TODO;
  }
}

export class AsyncContext {
  private static current: AsyncStack = null

  static getCurrent() {
    return this.current;
  }

  static set(ctx: AsyncStack) {
    this.current = ctx;
  }

  static Variable = AsyncVariable;
  static Snapshot = AsyncSnapshot;

  static fork() {
    return AsyncContext.forkWithData(null, null);
  }

  static run<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.runWithData(null, null, callback);
  }

  static wrap<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.wrapWithData(null, null, callback);
  }

  static forkWithData(variable: AsyncVariable | null, data: any) {
    const parent = AsyncContext.getCurrent();
    const fork = new AsyncStack(parent);
    fork.setData(variable, data);
    fork.start();
    return fork
  }

  static wrapWithData<Fn extends AnyFunction>(variable: AsyncVariable | null, data: any, callback: Fn): Fn {
    const wrapped = (...args) => {
      return AsyncContext.runWithData(variable, data, () => callback(...args));
    };

    return wrapped as Fn;
  }

  static runWithData<Fn extends (...args: any) => any>(variable: AsyncVariable | null, data: any, callback: Fn): ReturnType<Fn> {
    const asyncfork = AsyncContext.forkWithData(variable, data);
    const result = callback();
    asyncfork.reset();
    return result;
  }

  static getVariableData(variable: AsyncVariable | null) {
    let current = AsyncContext.getCurrent();

    while (true) {
      const value = current?.getData(variable);
      if (value !== undefined) {
        return value;
      }

      if (!current) break;
      current = current?.parent;
    }
  }
}

class AsyncStack {
  parent?: AsyncStack;
  data = new Map<AsyncVariable, any>();

  constructor(parent: AsyncStack) {
    this.parent = parent;
  }

  setData(variable: AsyncVariable | null, data: Record<string, any>) {
    return this.data.set(variable, data);
  }

  getData(variable: AsyncVariable | null) {
    return this.data.get(variable);
  }

  started = false;
  start() {
    if (this.started) return;
    this.started = true;
    AsyncContext.set(this);
  }

  reset() {
    AsyncContext.set(this.parent);
  }

  createResolver(callback) {
    return (...args: any[]) => {
      this.reset();

      const fork = AsyncContext.fork()
      const result = callback(...args);
      fork.reset();
      return result;
    }
  }
}