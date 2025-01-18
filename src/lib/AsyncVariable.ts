import { AsyncContext } from './AsyncContext'

type AnyFunction = (...args: any) => any;

export class AsyncVariable<Value = any> {
  static all = new Set<AsyncVariable>()

  constructor() {
    AsyncVariable.all.add(this);
  }

  *walk() {
    for (const a of AsyncVariable.walk(this)) {
      yield a;
    };
  }

  static *walk(variable: AsyncVariable<any>) {
    let current = AsyncContext.getCurrent();

    while (true) {

      const value = current?.getData(variable);
      if (value !== undefined) {
        yield value.value;
      }

      if (!current) break;
      current = current?.parent;
    }
  }

  static getVariable(variable: AsyncVariable<any> | null) {
    let current = AsyncContext.getCurrent();

    while (true) {
      const value = current?.getData(variable);
      if (value !== undefined) {
        return value?.value;
      }

      if (!current) break;
      current = current?.parent;
    }
  }

  dispose() {
    AsyncVariable.all.delete(this);
  }

  get(): Value {
    return AsyncVariable.getVariable(this);
  }

  run<Fn extends AnyFunction>(data: Value, callback: Fn) {
    return AsyncContext.runWithData(this, { value: data }, callback);
  }

  wrap<Fn extends AnyFunction>(data: Value, callback: Fn) {
    return AsyncContext.wrapWithData(this, { value: data }, callback);
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