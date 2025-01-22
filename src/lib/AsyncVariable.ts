import { AsyncStack } from '../polyfills/AsyncStack';
import { runInFork } from './utils/runInFork';

type AnyFunction = (...args: any) => any;

type VariableDataBox<Value = any> = { value: Value }

export class AsyncVariable<Value = any> {
  static all = new Set<AsyncVariable>();

  data = new WeakMap<AsyncStack, VariableDataBox>

  constructor() {
    AsyncVariable.all.add(this);
  }

  dispose() {
    AsyncVariable.all.delete(this);
  }

  getBox(stack: AsyncStack) {
    if (!stack) return undefined;

    const currentBox = this.data.get(stack);
    if (currentBox) return currentBox;

    const parentBox = this.getBox(stack.origin);
    if (parentBox) this.data.set(stack, parentBox);
    return parentBox;
  }

  set(stack: AsyncStack, data: any) {
    this.data.set(stack, {
      value: data
    });
  }

  get(): Value {
    const current = AsyncStack.getCurrent();
    return this.getBox(current)?.value;
  }

  run<Fn extends AnyFunction>(data: Value, callback: Fn) {
    return runInFork(() => {
      const current = AsyncStack.getCurrent();
      this.set(current, data);
      return callback();
    });
  }

  wrap<Fn extends AnyFunction>(data: Value, callback: Fn): Fn {
    // @ts-ignore
    return (...args) => this.run(data, () => callback(...args));
  }

  withData(data: Value) {
    return {
      run: <Fn extends AnyFunction>(callback: Fn) => {
        return this.run(data, callback);
      },
      wrap: <Fn extends AnyFunction>(callback: Fn) => {
        return this.wrap(data, callback);
      },
    }
  }
}