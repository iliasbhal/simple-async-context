import { AsyncStack } from '../polyfills/AsyncStack';
import { AsyncContext } from './AsyncContext';
import { AsyncVariable } from './AsyncVariable';
import { runInFork } from './utils/runInFork';

type AnyFunction = (...args: any) => any;

export class AsyncSnapshot {
  dataByVariable = new Map<AsyncVariable, any>();

  capture() {
    AsyncContext.Variable.all.forEach((asyncVariable) => {
      const data = asyncVariable.get();
      this.dataByVariable.set(asyncVariable, data)
    });
  }

  static create() {
    const snapshot = new AsyncSnapshot();
    snapshot.capture();
    return snapshot;
  }

  run<Fn extends AnyFunction>(callback: Fn) {
    return runInFork(() => {
      const current = AsyncStack.getCurrent();
      this.dataByVariable.forEach((data, variable) => {
        variable.set(current, data);
      })

      return callback();
    });
  }

  wrap<Fn extends AnyFunction>(callback: Fn) {
    return (...args) => this.run(() => callback(...args));
  }

  static wrap<Fn extends AnyFunction>(callback: Fn) {
    const snapshot = AsyncSnapshot.create();
    return snapshot.wrap(callback);
  }
}