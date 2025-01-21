import { AsyncStack } from '../polyfills/AsyncStack';

type AnyFunction = (...args: any) => any;

type VariableDataBox<Value = any> = { value: Value }

export class AsyncVariable<Value = any> {
  static all = new Set<AsyncVariable>();

  data = new Map<AsyncStack, VariableDataBox>

  constructor() {
    AsyncVariable.all.add(this);
  }

  dispose() {
    AsyncVariable.all.delete(this);
  }

  getBox() {
    let current = AsyncStack.getCurrent();
    while (true) {

      if (!current) break;
      const box = this.data.get(current);
      if (box) return box;

      current = current?.origin;
    }
  }

  set(stack: AsyncStack, data: any) {
    this.data.set(stack, {
      value: data
    });
  }

  get(): Value {
    return this.getBox()?.value;
  }

  run<Fn extends AnyFunction>(data: Value, callback: Fn) {
    const current = AsyncStack.getCurrent();
    const before = this.data.get(current);
    this.set(current, data);
    const result = callback();
    this.set(current, before);
    return result;
  }

  wrap<Fn extends AnyFunction>(data: Value, callback: Fn) {
    const wrapped = (...args) => {
      return this.run(data, () => callback(...args));
    };

    return wrapped as Fn;
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