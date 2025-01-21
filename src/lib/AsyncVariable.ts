import { AsyncStack } from '../polyfills/AsyncStack';
import { AsyncContext } from './AsyncContext'

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
    // console.log(this.data);
    return this.getBox()?.value;
  }

  run<Fn extends AnyFunction>(data: Value, callback: Fn) {
    const current = AsyncStack.getCurrent();
    const box = this.getBox();
    // console.log('before run', box);

    // console.log('SET DATA', data);
    this.set(current, data);



    const result = callback();

    if (box) {
      // this.set(current, box.value);
    }

    if (result instanceof Promise) {
      return new Promise(((resolve, reject) => {
        result.then((value) => {
          resolve(value);
          if (box) {
            this.set(current, box.value);
          }
        });;
      }));
    }

    return result;


    // if (box) {
    // }



    // console.log('RESET DATA', box);
    // reuse the same box


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