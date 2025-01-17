import { AsyncVariable } from './AsyncVariable'
import { AsyncSnapshot } from './AsyncSnapshot';

type AnyFunction = (...args: any) => any;

export class AsyncContext {
  private static current: AsyncContext = null

  static getCurrent() {
    const current = this.current;
    const snapshot = current?.getData(AsyncContext.SnapshotVariable)
    if (snapshot) {
      return snapshot.capture;
    }

    return current;
  }

  protected static set(ctx: AsyncContext) {
    this.current = ctx;
  }

  static Variable = AsyncVariable;
  static Snapshot = AsyncSnapshot;

  static SnapshotVariable = new AsyncVariable();

  static fork() {
    return AsyncContext.forkWithData(null, undefined);
  }

  static run<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.runWithData(null, undefined, callback);
  }

  static wrap<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.wrapWithData(null, undefined, callback);
  }

  static forkWithData(variable: AsyncVariable | null, data: any) {
    const parent = AsyncContext.getCurrent();
    const fork = new AsyncContext(parent);
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

    // use a try/fanilly block to ensure it keeps working 
    // even if the callback throws an error
    try {
      const result = callback();
      return result;
    } finally {
      asyncfork.reset();
    }
  }

  parent?: AsyncContext;
  data = new Map<AsyncVariable, any>();

  constructor(parent: AsyncContext) {
    this.parent = parent;
  }

  setData(variable: AsyncVariable | null, data: any) {
    if (data === undefined) return;
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
    let triggered = false;

    return (...args: any[]) => {
      if (triggered) return;
      triggered = true;

      this.reset();

      // Note: Is this fork neecessary? All tests are passing without it.
      // const fork = AsyncContext.fork()
      const result = callback(...args);
      // fork.reset();
      return result;
    }
  }

  clone() {
    const clone = new AsyncContext(this.parent?.clone());

    this.data.forEach((value, key) => {
      clone.setData(key, value);
    });

    return clone;
  }
}

