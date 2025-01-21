import { AsyncVariable } from './AsyncVariable'
import { AsyncSnapshot } from './AsyncSnapshot';

type AnyFunction = (...args: any) => any;

type VariableDataBox<Value = any> = { value: Value }

export class AsyncContext {
  private static Global = new AsyncContext(null);
  private static current: AsyncContext = null

  static getCurrent(): AsyncContext {
    const current = this.current;
    return current;
  }

  protected static set(ctx: AsyncContext) {
    this.current = ctx;
  }

  static Variable = AsyncVariable;
  static Snapshot = AsyncSnapshot;

  static NO_DATA = Symbol('NO_DATA');

  static fork() {
    return AsyncContext.forkWithData(null, AsyncContext.NO_DATA);
  }

  static run<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.runWithData(null, AsyncContext.NO_DATA, callback);
  }

  static wrap<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.wrapWithData(null, AsyncContext.NO_DATA, callback);
  }

  static wrapWithSnapshot<Fn extends AnyFunction>(snapshot: AsyncSnapshot, callback: Fn) {
    const wrapped = (...args) => {
      return AsyncContext.runWithSnapshot(snapshot, () => callback(...args));
    };

    return wrapped as Fn;
  }

  static runWithSnapshot<Fn extends AnyFunction>(snapshot: AsyncSnapshot, callback: Fn) {
    const asyncfork = AsyncContext.forkWithSnapshot(snapshot);

    // use a try/catch block to ensure it keeps working 
    // even if the callback throws an error
    try {
      const result = callback();
      asyncfork.reset();
      return result;
    } catch {
      asyncfork.reset();
      return;
    }
  }

  static forkWithSnapshot(snapshot: AsyncSnapshot) {
    const origin = AsyncContext.getCurrent();
    const fork = new AsyncContext(snapshot.stack);
    fork.start();
    return {
      reset() {
        fork.reset();
        AsyncContext.set(origin);
      }
    }
  }

  static forkWithData(variable: AsyncVariable | null, data: any) {
    const origin = AsyncContext.getCurrent();
    const fork = new AsyncContext(origin);

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

  origin?: AsyncContext;
  data = new Map<AsyncVariable, VariableDataBox>();

  constructor(origin: AsyncContext | null) {
    this.origin = origin || AsyncContext.Global;
  }

  private getBox(variable: AsyncVariable | null): VariableDataBox {
    const data = this.data.get(variable);
    if (data) return data;

    const upstreamBox = this.origin?.getBox(variable);
    if (upstreamBox) {
      this.data.set(variable, upstreamBox);
    }

    return upstreamBox;
  }

  setData(variable: AsyncVariable | null, data: any) {
    if (data === AsyncContext.NO_DATA) return;
    return this.data.set(variable, { value: data });
  }

  getData(variable: AsyncVariable | null) {
    const box = this.getBox(variable);
    return box?.value
  }

  start() {
    AsyncContext.set(this);
  }

  reset() {
    AsyncContext.set(this.origin);
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
}

