import { AsyncContext } from './AsyncContext';
import { AsyncStack } from '../polyfills/AsyncStack'

type AnyFunction = (...args: any) => any;

export class AsyncSnapshot {
  stack: AsyncStack;

  constructor() {
    // this.stack = AsyncSnapshot.capture();
  }

  static capture() {
    const current = AsyncStack.getCurrent();

    // const clone: AsyncStack = new AsyncStack(null);
    // AsyncContext.Variable.all.forEach((asyncVariable) => {
    //   const variableData = current.getData(asyncVariable)
    //   clone.setData(asyncVariable, variableData);
    // });

    // return clone;
  }

  static create() {
    return new AsyncSnapshot();
  }

  run<Fn extends AnyFunction>(callback: Fn) {
    // return AsyncContext.runWithSnapshot(this, callback);
  }

  wrap<Fn extends AnyFunction>(callback: Fn) {
    // return AsyncContext.wrapWithSnapshot(this, callback);
  }

  static wrap<Fn extends AnyFunction>(callback: Fn) {
    const snapshot = AsyncSnapshot.create();
    return snapshot.wrap(callback);
  }
}