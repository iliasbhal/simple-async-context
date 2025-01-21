import { AsyncStack } from '../polyfills/AsyncStack';
import { AsyncVariable } from './AsyncVariable'
import { AsyncSnapshot } from './AsyncSnapshot';

type AnyFunction = (...args: any) => any;

type VariableDataBox<Value = any> = { value: Value }

export class AsyncContext {
  static Variable = AsyncVariable;
  static Snapshot = AsyncSnapshot;

  // static wrapWithSnapshot<Fn extends AnyFunction>(snapshot: AsyncSnapshot, callback: Fn) {
  //   const wrapped = (...args) => {
  //     return AsyncContext.runWithSnapshot(snapshot, () => callback(...args));
  //   };

  //   return wrapped as Fn;
  // }

  // static runWithSnapshot<Fn extends AnyFunction>(snapshot: AsyncSnapshot, callback: Fn) {
  //   const asyncfork = AsyncContext.forkWithSnapshot(snapshot);

  //   // use a try/catch block to ensure it keeps working 
  //   // even if the callback throws an error
  //   try {
  //     const result = callback();
  //     asyncfork.reset();
  //     return result;
  //   } catch {
  //     asyncfork.reset();
  //     return;
  //   }
  // }

  // static forkWithSnapshot(snapshot: AsyncSnapshot) {
  //   const origin = AsyncStack.fork();
  //   const fork = new AsyncStack(snapshot.stack);
  //   fork.start();
  //   return {
  //     reset() {
  //       fork.reset();
  //       origin.reset()
  //     }
  //   }
  // }

  static dataByStack = new WeakMap<AsyncStack, VariableDataBox>

  static forkWithData(variable: AsyncVariable | null, data: any) {
    const current = AsyncStack.getCurrent();
    variable.set(current, data);
  }

  static linkData(stack: AsyncStack, variable: AsyncVariable, data: any) {
    if (!data) return;
    // AsyncContext.dataByStack.set(fork, data)
  }

  static wrapWithData<Fn extends AnyFunction>(variable: AsyncVariable | null, data: any, callback: Fn): Fn {
    const wrapped = (...args) => {
      return AsyncContext.runWithData(variable, data, () => callback(...args));
    };

    return wrapped as Fn;
  }

  static runWithData<Fn extends (...args: any) => any>(variable: AsyncVariable | null, data: any, callback: Fn): ReturnType<Fn> {
    AsyncContext.forkWithData(variable, data);
    return callback();
  }
}

