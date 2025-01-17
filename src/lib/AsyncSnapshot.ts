import { AsyncContext } from './AsyncContext'

type AnyFunction = (...args: any) => any;

export class AsyncSnapshot {
  capture: AsyncContext;

  constructor() {
    this.capture = AsyncSnapshot.capture();
  }

  static capture() {
    const current = AsyncContext.getCurrent();
    const cloned = current?.clone();
    return cloned;
  }

  static create() {
    return new AsyncSnapshot();
  }

  run<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.runWithData(AsyncContext.SnapshotVariable, this, callback);
  }

  wrap<Fn extends AnyFunction>(callback: Fn) {
    return AsyncContext.wrapWithData(AsyncContext.SnapshotVariable, this, callback);
  }
}