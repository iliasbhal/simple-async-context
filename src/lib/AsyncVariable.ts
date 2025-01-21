import { AsyncContext } from './AsyncContext'

type AnyFunction = (...args: any) => any;

export class AsyncVariable<Value = any> {
  static all = new Set<AsyncVariable>()

  constructor() {
    AsyncVariable.all.add(this);
  }

  dispose() {
    AsyncVariable.all.delete(this);
  }

  get(): Value {
    const current = AsyncContext.getCurrent();
    return current?.getData(this)
  }

  run<Fn extends AnyFunction>(data: Value, callback: Fn) {
    return AsyncContext.runWithData(this, data, callback);
  }

  wrap<Fn extends AnyFunction>(data: Value, callback: Fn) {
    return AsyncContext.wrapWithData(this, data, callback);
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