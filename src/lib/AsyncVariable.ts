import { AsyncContext } from './AsyncContext'

type AnyFunction = (...args: any) => any;

export class AsyncVariable {
  static getVariable(variable: AsyncVariable | null) {
    let current = AsyncContext.getCurrent();

    while (true) {
      const value = current?.getData(variable);
      if (value !== undefined) {
        return value;
      }

      if (!current) break;
      current = current?.parent;
    }
  }

  get() {
    const value = AsyncVariable.getVariable(this);
    return value?.value;
  }

  run<Fn extends AnyFunction>(data: any, callback: Fn) {
    return AsyncContext.runWithData(this, { value: data }, callback);
  }

  wrap<Fn extends AnyFunction>(data: any, callback: Fn) {
    return AsyncContext.wrapWithData(this, { value: data }, callback);
  }

  withData(data: any) {
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